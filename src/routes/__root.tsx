import Footer from '@/components/footer-section';
import NavigationBar from '@/components/navigation-bar';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <div className='min-h-screen'>
      <NavigationBar />
      <Outlet />
      <Footer />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  );
}
