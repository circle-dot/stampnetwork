import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const showLoadingAlert = () => {
    MySwal.fire({
        title: 'Processing...',
        text: 'Please wait while your request is being processed.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

export const showErrorAlert = (message: string) => {
    MySwal.fire({
        icon: 'error',
        title: 'Error!',
        text: message,
    });
};

export const showSuccessAlert = (message: string, confirmText: string, redirectUrl: string) => {
    MySwal.fire({
        icon: 'success',
        title: 'Success!',
        text: message,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Close',
        cancelButtonColor: '#d33',
        confirmButtonColor: '#3085d6',
    }).then((result) => {
        if (result.isConfirmed) {
            window.open(redirectUrl, '_blank');
        }
    });
};

export const showOnlySucessWithRedirect = (message: string, confirmText: string, redirectUrl: string) => {
    MySwal.fire({
        title: "Zupass connected!",
        text: message,
        confirmButtonText: confirmText,
        allowOutsideClick: false,
        icon: "success"
      }).then((result) => {
        if (result.isConfirmed) {
            // router.push(redirectUrl)
            window.location.href = redirectUrl;
        }
    });

}