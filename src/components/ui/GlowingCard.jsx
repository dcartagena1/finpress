import clsx from 'clsx';

export const GlowingCard = ({ children, gradient, className, style }) => {
    // NOTE: Retaining component name "GlowingCard" to avoid breaking extraneous imports immediately,
    // but changing implementation to "Clean Card". gradient prop is ignored or used for header accents if we wanted.

    return (
        <div
            className={clsx("card", className)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                ...style
            }}
        >
            {children}
        </div>
    );
};
