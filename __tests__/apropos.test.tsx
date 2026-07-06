import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Page from '../app/(dashboard)/apropos/page'; // Component to test

// Mocks the page component wrapper
vi.mock('@/components/ui/page-components', () => ({
    PageHeader: ({ title, description }: { title: string, description: string }) => (
        <div data-testid="page-header">
            <h1 data-testid="mock-title">{title}</h1>
            <p data-testid="mock-description">{description}</p>
        </div>
    ),
    ClientOnly: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('A Propos Page', () => {
    it('renders without crashing', () => {
        render(<Page />);

        // Check if header exists
        expect(screen.getByTestId('page-header')).toBeInTheDocument();
        expect(screen.getByTestId('mock-title')).toHaveTextContent('À propos de Moomen.pro');
    });

    it('displays the three main sections', () => {
        render(<Page />);

        // Check main titles
        expect(screen.getByText('Notre Histoire')).toBeInTheDocument();
        expect(screen.getByText('Notre Mission')).toBeInTheDocument();
        expect(screen.getByText('Le Succès')).toBeInTheDocument();

        // Check basic content rendering (utiliser un getByText avec fonction pour ignorer le HTML <strong>)
        expect(screen.getByText((content, element) => {
            return element?.textContent === "Moomen.pro est une solution pensée pour accompagner les entrepreneurs, commerçants et professionnels africains dans la gestion quotidienne de leur activité.";
        })).toBeInTheDocument();
    });
});
