interface ErrorStateProps {
  onRetry?: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <p>
        Oeps! Het lijkt erop dat er iets is misgegaan...
      </p>
      <br></br>
      <button
        onClick={handleRetry}
        className="bg-astral-500 hover:bg-astral-600 text-white px-4 py-2 rounded-md"
      >
        Probeer opnieuw
      </button>
    </div>
  );
}