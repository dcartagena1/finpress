import { LiquidityCard } from './dashboard/LiquidityCard';
import { RiskCard } from './dashboard/RiskCard';
import { SavingsCard } from './dashboard/SavingsCard';
import { BudgetCard } from './dashboard/BudgetCard';
import { DeviationsCard } from './dashboard/DeviationsCard';
import { ProjectionCard } from './dashboard/ProjectionCard';

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

            {/* Main Content Area (Left 8 cols) */}
            <div className="col-span-12 lg:col-span-8 flex-col" style={{ gap: '1.5rem' }}>
                <ProjectionCard />
                <BudgetCard />
            </div>

            {/* Sidebar (Right 4 cols) */}
            <div className="col-span-12 lg:col-span-4 flex-col" style={{ gap: '1.5rem' }}>
                <RiskCard />
                <SavingsCard />
                <DeviationsCard />
            </div>
        </div>
    );
};
