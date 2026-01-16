import { LiquidityCard } from './dashboard/LiquidityCard';
import { RiskCard } from './dashboard/RiskCard';
import { SavingsCard } from './dashboard/SavingsCard';
import { BudgetCard } from './dashboard/BudgetCard';
import { DeviationsCard } from './dashboard/DeviationsCard';

export const Dashboard = () => {
    return (
        <div style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(12, 1fr)',
        }}>
            {/* Row 1: Banner - Full Width */}
            <div className="col-span-12">
                <LiquidityCard />
            </div>

            {/* Left Column (Alerts & Deviations) */}
            <div className="col-span-12 md:col-span-6 flex-col" style={{ gap: '1.5rem' }}>
                <RiskCard />
                <DeviationsCard />
                <BudgetCard />
            </div>

            {/* Right Column (Goals) */}
            <div className="col-span-12 md:col-span-6">
                <SavingsCard />
            </div>
        </div>
    );
};
