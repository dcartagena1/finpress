import { startOfMonth, endOfMonth, isBefore, isAfter, addMonths, format, parseISO, isSameMonth } from 'date-fns';

/**
 * Principio Fundamental: Saldo Disponible Conservador
 * Saldo Real - Gastos Recurrentes Próximos (30d) - Créditos - Ahorros Pendientes
 */
export const calculateConservativeBalance = (transactions, goals, currentDate = new Date()) => {
    // 1. Saldo Real Actual (Sum of all executed/confirmed transactions)
    // NOTE: In this app, we might also consider "projected" income if we trusted it, 
    // but the prompt says "Saldo general: todo el dinero registrado." which implies confirmed stuff usually,
    // BUT later "Saldo disponible = Saldo General - recurrentes...".
    // Let's assume Saldo General = Sum of all CONFIRMED transactions (Income - Expense).

    const generalBalance = transactions
        .filter(t => t.confirmed)
        .reduce((acc, t) => {
            return t.type === 'INCOME' ? acc + t.amount : acc - t.amount;
        }, 0);

    // 2. Gastos Recurrentes Próximos (Next 30 days) that are NOT confirmed yet.
    // We need to find recurring transactions that "should happen" in the next 30 days.
    // The user registers a recurring expense definition. Detailed logic needed here.
    // FOR NOW, we assume `transactions` contains "instances" of expenses. 
    // If the user manually inputs specific projected instances, we sum the unconfirmed ones pending in 30 days.
    // If the prompt implies "Risk active" for forgotten recurrents, we include those too.

    // Filter: Expenses, Unconfirmed, Date <= Next 30 Days.
    const next30Days = addMonths(currentDate, 1);

    const pendingCommitments = transactions
        .filter(t =>
            t.type === 'EXPENSE' &&
            !t.confirmed &&
            (isBefore(parseISO(t.date), next30Days) || isSameMonth(parseISO(t.date), next30Days))
        )
        .reduce((acc, t) => acc + t.amount, 0);

    // 3. Compromisos de ahorro pendientes
    // Goals that suggest a monthly savings amount not yet transferred?
    // The prompt says: "Metas afectan el saldo disponible, aunque el dinero no se haya transferido."
    // So we deduct the "Blocked" amount or the "Target Progress" amount?
    // "El usuario debe transferir manualmente... El dinero transferido queda bloqueado conceptualmente."
    // implies that ONCE transferred (transaction made), it subtracts from General Balance (if transfer is expense) OR stays in General but is "Blocked".

    // Let's model "Transfers to Goals" as Expenses typically, OR we keep them in Valid Balance but deduct here.
    // Better approach: "Goal Balance" is part of General Balance but "Reserved".
    // So Available = General - Reserved.

    const reservedForGoals = goals.reduce((acc, g) => acc + (g.accumulated || 0), 0);

    // 4. Monthly Savings targets NOT yet met?
    // "Si un mes no se cumple el ahorro esperado -> alerta."
    // Should we deduct the *expected* saving for this month if not done? 
    // "Compromisos de ahorro pendientes" suggests yes.

    // Let's stick to: Available = General - Pending Expenses (30d) - Reserved (Accumulated in goals).

    return {
        generalBalance,
        pendingCommitments,
        reservedForGoals,
        availableBalance: generalBalance - pendingCommitments - reservedForGoals
    };
};

export const detectRisks = (transactions, currentDate = new Date()) => {
    // Risk = Recurrent Expense Date Passed AND Not Confirmed.
    return transactions.filter(t => {
        return (
            t.type === 'EXPENSE' &&
            (t.isRecurring || t.isObligation) && // Assuming we flag them
            !t.confirmed &&
            isBefore(parseISO(t.date), currentDate)
        );
    });
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};
