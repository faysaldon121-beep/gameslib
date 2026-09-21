import React from 'react';
import { useRouteData } from 'react-static';

// --- Reusable Sub-Components ---
const SectionHeading = ({ children }) => (
  <h2 className="text-3xl font-light text-gray-800 border-b border-gray-200 pb-2 mb-6">
    {children}
  </h2>
);

const SidebarWidget = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="bg-lime-600 text-white font-bold uppercase text-sm p-2 rounded-t-lg shadow">
      {title}
    </h3>
    <div className="bg-gray-50 border border-t-0 border-gray-300 p-4 rounded-b-lg">
      {children}
    </div>
  </div>
);

// --- Main Page Template (Content Only) ---
export default function SoftwarePage() {
  // useRouteData hook gets the data passed from static.config.js for this specific route
  const { software } = useRouteData();

  if (!software) {
    return <div>Loading software data or data not found...</div>;
  }

  const {
    title,
    category,
    description,
    system_requirements,
    details,
    image_links,
    download_links,
  } = software;

  return (
    // The main container for the software page content.
    // In a real app, this would be placed inside a global Layout component.
    <main className="bg-white py-8 font-sans text-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-12 gap-8">
          
          {/* Left Column: Main Article */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9">
            <article>
              <p className="text-sm text-gray-500 mb-4">
                <a href="#" className="text-lime-600 hover:underline">Home</a> » 
                <a href="#" className="text-lime-600 hover:underline"> Softwares</a> » 
                <a href="#" className="text-lime-600 hover:underline"> {category}</a> » 
                <span className="text-gray-700"> {title}</span>
              </p>

              <h1 className="text-4xl font-light text-gray-900 mb-6">{title}</h1>
              <p className="text-lg mb-6">{description.short}</p>

              <SectionHeading>Overview</SectionHeading>
              <p className="leading-relaxed mb-6">{description.long.overview}</p>

              <img 
                src={image_links.poster} 
                alt={`${title} Poster`}
                className="w-full max-w-lg mx-auto my-8 border-4 border-gray-200 rounded-md shadow-lg"
              />

              <SectionHeading>Features of {title}</SectionHeading>
              <ul className="list-disc list-inside space-y-2 mb-8 pl-4">
                {description.long.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
                  {image_links.screenshots.map((src, index) => (
                      <img key={index} src={src} alt={`${title} screenshot ${index + 1}`} className="border-2 border-gray-200 rounded shadow" />
                  ))}
              </div>

              <SectionHeading>System Requirements</SectionHeading>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-bold mb-2">Minimum Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><strong>OS:</strong> {system_requirements.minimum.os}</li>
                  <li><strong>Processor:</strong> {system_requirements.minimum.processor}</li>
                  <li><strong>Memory (RAM):</strong> {system_requirements.minimum.ram}</li>
                  <li><strong>Hard Disk Space:</strong> {system_requirements.minimum.storage}</li>
                </ul>
              </div>
              
              <SectionHeading>Technical Setup Details</SectionHeading>
               <div className="bg-gray-50 p-4 rounded-lg border mt-8">
                  <ul className="space-y-1">
                      <li><strong>Software Full Name:</strong> {title}</li>
                      <li><strong>Version:</strong> {details.version_number}</li>
                      <li><strong>Setup Size:</strong> {details.software_size}</li>
                      <li><strong>Language:</strong> {details.language}</li>
                      <li><strong>Last Updated:</strong> {details.last_update}</li>
                  </ul>
              </div>

              <SectionHeading>Download {title}</SectionHeading>
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg my-8 text-center">
                <p className="mb-6">Click on the buttons below to start the download. This is a complete offline installer and standalone setup.</p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  {download_links.map(link => (
                    <a 
                      key={link.architecture}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-b from-gray-200 to-gray-100 border border-gray-400 rounded-md px-8 py-3 font-bold text-gray-800 hover:from-gray-300 shadow-md transition-transform transform hover:scale-105"
                    >
                      Download {link.architecture} <span className="text-sm font-normal text-gray-600">({link.size})</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="text-center my-10">
                <h3 className="text-2xl font-bold">
                  Files Password: <span className="bg-red-600 text-white px-3 py-1 rounded-md text-3xl">123</span>
                </h3>
              </div>
            </article>
          </div>

          {/* Right Column: Sidebar */}
          <aside className="col-span-12 md:col-span-4 lg:col-span-3">
             <SidebarWidget title="Search">
              <input 
                type="text" 
                placeholder="Search website..."
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-lime-500 focus:outline-none"
              />
            </SidebarWidget>

            <SidebarWidget title="Advertise With Us">
              <a href="#"><img src="https://via.placeholder.com/300x160.png?text=Your+Ad+Here" alt="Advertise" className="mx-auto" /></a>
            </SidebarWidget>
          </aside>
        </div>
      </div>
    </main>
  );
}