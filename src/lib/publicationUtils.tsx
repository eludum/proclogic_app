export const getTimeRemaining = (deadline: string | number | Date | null | undefined) => {
    if (!deadline) return { text: "No deadline", variant: "neutral" };

    const now = new Date();
    const dueDate = new Date(deadline);
    const timeDiff = dueDate.getTime() - now.getTime();

    // If past due
    if (timeDiff < 0) return { text: "Verlopen", variant: "expired" };

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Urgent: less than 3 days
    if (days < 3) {
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days === 0) {
            return { text: `${hours} u resterend`, variant: "urgent" };
        }
        return { text: `${days}d ${hours}u resterend`, variant: "urgent" };
    }

    // Soon: less than 7 days
    if (days < 7) {
        return { text: `${days} dagen resterend`, variant: "soon" };
    }

    // Weeks
    if (days < 30) {
        const weeks = Math.floor(days / 7);
        const remainingDays = days % 7;
        return {
            text: `${weeks} ${weeks == 1 ? 'week' : ''} ${weeks !== 1 ? 'weken' : ''} ${remainingDays > 0 ? `${remainingDays}d` : ''} resterend`,
            variant: "comfortable"
        };
    }

    if (days === 31) return { text: "1 maand resterend", variant: "comfortable" };

    // Months
    if (days < 365) {
        const months = Math.floor(days / 30);
        return {
            text: `${months} maand${months !== 1 ? 's' : ''} resterend`,
            variant: "comfortable"
        };
    }

    // Years
    const years = Math.floor(days / 365);
    return {
        text: `> 1 jaar resterend`,
        variant: "comfortable"
    };
};

export const formatDate = (dateString: string | number | Date | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
};


export const getTimeRemainingStyles = (variant: string) => {
    switch (variant) {
        case "urgent":
            return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
        case "soon":
            return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
        case "comfortable":
            return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
        case "expired":
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
};