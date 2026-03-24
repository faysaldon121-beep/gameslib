import Link from 'next/link';

interface Props {
  current: string;
  parents?: { name: string; href: string }[];
}

export default function Breadcrumbs({ current, parents = [] }: Props) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gameslib.net' },
      ...parents.map((parent, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: parent.name,
        item: `https://gameslib.net${parent.href}`,
      })),
      { '@type': 'ListItem', position: parents.length + 2, name: current, item: `https://gameslib.net${window.location.pathname}` },
    ],
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li>
            <Link href="/" className="hover:text-white">Home</Link>
          </li>
          {parents.map((parent) => (
            <li key={parent.href} className="flex items-center">
              <span>/</span>
              <Link href={parent.href} className="hover:text-white ml-1">{parent.name}</Link>
            </li>
          ))}
          <li className="flex items-center">
            <span>/</span>
            <span className="ml-1 font-medium text-white">{current}</span>
          </li>
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
