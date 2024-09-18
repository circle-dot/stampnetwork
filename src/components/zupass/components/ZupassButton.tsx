"use client";
import { useZupass } from "../zupass";
import { useZupassPopupMessages } from "@pcd/passport-interface";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { showTempSuccessAlert, showErrorAlert, showSuccessAlert, showTempErrorAlert, showLoadingAlert } from "@/utils/alertUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Swal from "sweetalert2";
import { checkSemaphoreAttestation } from "../utils/checkSemaphoreAttestation";
import { handleVouch } from "../utils/handleVouchPretrust";

interface ZupassButtonProps {
	children?: React.ReactNode;
	community: any;
}

export default function ZupassButton({ children, community }: ZupassButtonProps) {
	const [loading, setLoading] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [ticketsToSign, setTicketsToSign] = useState<any[]>([]);
	const [signingIndex, setSigningIndex] = useState<number | null>(null);

	const { login } = useZupass();
	const [multiPCDs] = useZupassPopupMessages();

	useEffect(() => {
		if (multiPCDs) {
			console.log("🚀 ~ multiPCDs:", multiPCDs);
		}
	}, [multiPCDs]);

	useEffect(() => {
		if (ticketsToSign.length > 0) {
			Swal.close(); // Close the loading alert when tickets are ready
			setDialogOpen(true);
		}
	}, [ticketsToSign]);

	const { getAccessToken, user } = usePrivy();
	const { wallets } = useWallets();

	const loginHandler = async () => {
		showLoadingAlert(); // Show loading alert when button is clicked
		setLoading(true);
		try {
			const token = await getAccessToken();
			await login(user, wallets, token, setTicketsToSign); 
		} catch (error) {
			console.error("Error during login:", error);
			showErrorAlert("Failed to connect Zupass. Please try again.");
		} finally {
			setLoading(false);
			Swal.close(); // Close the loading alert
		}
	};

	const handleSign = async (index: number) => {
		const ticket = ticketsToSign[index];
		if (ticket.signed) return;
		setSigningIndex(index);
		showLoadingAlert();
		try {
			if (!user || !user.wallet) {
				throw new Error('User or user wallet not found');
			}
			const wallet = wallets.find(w => w.walletClientType === user.wallet?.walletClientType);
			if (!wallet) {
				throw new Error('Desired wallet not found');
			}
			const address = wallet.address;

			const attestationCheck = await checkSemaphoreAttestation(
				ticket.external_id, 
				ticket.ticketType, 
				address,
				ticket.email 
			);
			
			if (attestationCheck.exists) {
				if (attestationCheck.isSameWallet) {
					await showTempSuccessAlert(`Ticket ${ticket.ticketType} is already connected to your account.`);
					setTicketsToSign(prev => prev.map((t, i) => i === index ? { ...t, signed: true } : t));
					return;
				} else {
					showTempErrorAlert(`Ticket ${ticket.ticketType} is already connected to another account.`);
					return;
				}
			}

			console.log('ticket', ticket);
			const results = await handleVouch(user, wallets, await getAccessToken(), {
				add_groups: [ticket], // Wrap the single ticket in an array
				external_id: ticket.external_id
			}, community);

			if (results && results.length > 0) {
				const result = results[0]; // We're only processing one ticket at a time here

				if (result.alreadyConnected) {
					await showTempSuccessAlert(`Ticket ${ticket.ticketType} is already connected to an account.`);
				} else if (result.error) {
					showTempErrorAlert(`Failed to process ticket: ${ticket.ticketType}`);
				} else {
					await showTempSuccessAlert(`Ticket ${ticket.ticketType} signed successfully!`);
				}

				setTicketsToSign(prev => prev.map((t, i) => i === index ? { ...t, signed: true } : t));

				// Check if all tickets are signed
				const allSigned = ticketsToSign.every(t => t.signed);
				if (allSigned) {
					showSuccessAlert('All Zupass tickets processed successfully.', 'Go to profile', `/me`);
					setDialogOpen(false);
				}
			} else {
				showErrorAlert('No results returned from handleVouch');
			}
		} catch (error) {
			console.error('Error processing ticket:', error);
			showTempErrorAlert(`Failed to process ticket: ${ticket.ticketType}`); // Changed to temp error alert
		} finally {
			setSigningIndex(null);
			Swal.close(); // Close the loading alert
		}
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
		setTicketsToSign([]); // Reset ticketsToSign when dialog closes
	};

	if (loading) {
		return <p>loading...</p>;
	}

	return (
		<>
			<Button onClick={loginHandler} className="bg-[#f0b90b] hover:bg-[#d9a60b] text-[#19473f] font-semibold font-[Tahoma]">
				{children || "Connect Zupass"}
			</Button>
			<Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
				<DialogContent className="bg-[#19473f] text-[#f0b90b]" onInteractOutside={(e) => {
					e.preventDefault();
				}}>
					<DialogHeader>
						<DialogTitle className="text-[#f0b90b] font-semibold">Sign Your Zupass Tickets</DialogTitle>
						<DialogDescription className="text-[#f0b90b] opacity-80">
							Choose which tickets you'd like to sign and connect to your account.
						</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-2 gap-4">
						{ticketsToSign.map((ticket, index) => (
							<div key={index} className="flex justify-between items-center">
								<span className="text-[#f0b90b]">{ticket.ticketType}</span>
								<Button
									onClick={() => handleSign(index)}
									disabled={ticket.signed || signingIndex === index}
									className={`font-semibold font-[Tahoma] ${
										ticket.signed
											? "bg-green-500 hover:bg-green-600 text-[#19473f]"
											: signingIndex === index
											? "bg-gray-400 text-[#19473f]"
											: "bg-[#f0b90b] hover:bg-[#d9a60b] text-[#19473f]"
									}`}
								>
									{ticket.signed
										? "Signed!"
										: signingIndex === index
										? "Signing..."
										: "Sign"}
								</Button>
							</div>
						))}
					</div>
					<DialogFooter>
						<Button
							onClick={handleDialogClose}
							className="bg-[#f0b90b] hover:bg-[#d9a60b] text-[#19473f] font-semibold font-[Tahoma]"
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
