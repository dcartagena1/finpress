import clsx from 'clsx';

export const GlowingCard = ({ children, className, style }) => {
    return (
        <div
            className={clsx("card", className)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                ...style
            }}
        >
            {children}
        </div>
    );
};
