import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black z-50">
      <Image
        src="/stamp.svg"
        alt="Loading"
        width={100}
        height={100}
        className="animate-pulse"
      />
    </div>
  );
}