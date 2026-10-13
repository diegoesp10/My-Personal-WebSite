import { ErrorScreen } from '../components/ErrorScreen';

/** Unknown route, project or journal entry: the error page inside the layout, keeping the address. */
export default function NotFoundPage({ what = 'página' }: { what?: string }) {
  return (
    <ErrorScreen code={what === 'página' ? 'route.not_found' : 'resource.not_found'} embedded />
  );
}
