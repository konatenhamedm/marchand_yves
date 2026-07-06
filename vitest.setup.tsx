import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mocks next/navigation
vi.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: vi.fn(),
            replace: vi.fn(),
            pathname: '/',
            query: '',
            asPath: '',
        };
    },
    usePathname() {
        return '';
    },
}));

// Mocks next/image
vi.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />;
    },
}));
