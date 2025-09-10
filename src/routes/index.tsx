import { createFileRoute } from '@tanstack/react-router';

// @ts-ignore
export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h2>Welcome</h2>
      <p>Your one-stop shop for accessible products!</p>
    </div>
  );
}
