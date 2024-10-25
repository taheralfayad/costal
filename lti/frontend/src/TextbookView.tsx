import React, { FC , useState} from 'react';


interface TextbookViewProps {}

// Basic interfaces for textbook data, subject to change based on real data interactions!
interface SubSection{
   heading: String;
   content: Array<String | {src: String, alt: String}>;

}

interface Chapter{
   heading: String;
   subsections: Array<SubSection>;

}

interface Contents {
   subChapters: Array<Chapter>;
   references: Chapter;
   acknowledgements: Chapter;
   authors: Chapter;
}

interface TextbookData {
   title: String;
   contents: Array<Contents>;

}

function parseDocument(): TextbookData {
   // Test data to be replaced with the actual document data.
   return {
      title: 'Introduction to Computer Science',
      contents: [
        {
          subChapters: [
            {
              heading: 'Chapter 1: Basics of Programming',
              subsections: [
                {
                  heading: 'Introduction to Programming',
                  content: [
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque at venenatis ex, eu sagittis felis.',
                    'Programming is the process of creating a set of instructions that tell a computer how to perform a task.',
                  ],
                },
                {
                  heading: 'Hello World Example',
                  content: [
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer facilisis lectus vitae elit ultricies, a condimentum libero pretium.',
                     'Zander Preston.'
                  ],
                },
              ],
            },
            {
              heading: 'Chapter 2: Really Long and Scrollable Data Structures',
              subsections: [
                {
                  heading: 'Arrays and Lists',
                  content: [
                    'Arrays are a collection of elements, each identified by an array index. Lists, on the other hand, are dynamic and can grow or shrink as needed.',
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus id felis a eros malesuada bibendum.',
                  ],
                },
                {
                  heading: 'Trees and Graphs',
                  content: [
                    'Trees are a hierarchical data structure, while graphs consist of nodes connected by edges. These are fundamental for many algorithms.',
                    { src: 'https://unsplash.com/photos/president-barack-obama-WYmjDP_8kMU', alt: 'Tree Example' },
                  ],
                },
                {
                  heading: 'Trees and Graphs',
                  content: [
                    'Trees are a hierarchical data structure, while graphs consist of nodes connected by edges. These are fundamental for many algorithms.',
                    { src: 'https://unsplash.com/photos/president-barack-obama-WYmjDP_8kMU', alt: 'Tree Example' },
                  ],
                },
                {
                  heading: 'Trees and Graphs',
                  content: [
                    'Trees are a hierarchical data structure, while graphs consist of nodes connected by edges. These are fundamental for many algorithms.',
                    { src: 'https://unsplash.com/photos/president-barack-obama-WYmjDP_8kMU', alt: 'Tree Example' },
                  ],
                },
                {
                  heading: 'Trees and Graphs',
                  content: [
                    'Trees are a hierarchical data structure, while graphs consist of nodes connected by edges. These are fundamental for many algorithms.',
                    { src: 'https://unsplash.com/photos/president-barack-obama-WYmjDP_8kMU', alt: 'Tree Example' },
                  ],
                },
                {
                  heading: 'Trees and Graphs',
                  content: [
                    'Trees are a hierarchical data structure, while graphs consist of nodes connected by edges. These are fundamental for many algorithms.',
                    { src: 'https://unsplash.com/photos/president-barack-obama-WYmjDP_8kMU', alt: 'Tree Example' },
                  ],
                },
              ],
            },
          ],
          references: {
            heading: 'References',
            subsections: [
              {
                heading: 'Reference 1',
                content: [
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed bibendum turpis ut felis dignissim.',
                ],
              },
              {
                heading: 'Reference 2',
                content: ['Phasellus a metus quis justo pharetra eleifend a nec nunc.'],
              },
            ],
          },
          acknowledgements: {
            heading: 'Acknowledgements',
            subsections: [
              {
                heading: 'Acknowledgement 1',
                content: [
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eget nulla in metus suscipit dictum.',
                ],
              },
            ],
          },
          authors: {
            heading: 'Authors',
            subsections: [
              {
                heading: 'Author 1: John Doe',
                content: ['John Doe is a professor of computer science with over 20 years of experience.'],
              },
              {
                heading: 'Author 2: Jane Smith',
                content: ['Jane Smith is a software engineer and author with a background in data structures and algorithms.'],
              },
            ],
          },
        },
      ],
    };
  }
  


// Use the parseDocument function written in the backend to parse and assign the textbook data.
// TODO: Fix the parseDocument function to invoke the API.
const parsedTextbookData: TextbookData = parseDocument();



// TODO: Styling to make textbook view mesh with the rest of the application.
const TextbookView: FC<TextbookViewProps> = () => {
   const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
   const { subChapters, references, acknowledgements, authors } = parsedTextbookData.contents[0];
 
   // Total number of sections (subChapters + References + Acknowledgements + Authors)
   const totalSections = subChapters.length + 3; // 3 for references, acknowledgements, authors
 
   // Determine the current content based on the index
   let currentContent;
   if (currentChapterIndex < subChapters.length) {
     currentContent = subChapters[currentChapterIndex];
   } else if (currentChapterIndex === subChapters.length) {
     currentContent = references;
   } else if (currentChapterIndex === subChapters.length + 1) {
     currentContent = acknowledgements;
   } else if (currentChapterIndex === subChapters.length + 2) {
     currentContent = authors;
   }
 
   return (
     <div className="flex flex-col h-screen">
       <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
         <h1 className="text-xl font-bold">{parsedTextbookData.title}</h1>
         <div className="relative">
           <select
             className="text-black p-2 rounded"
             value={currentChapterIndex}
             onChange={(e) => setCurrentChapterIndex(Number(e.target.value))}
           >
             {subChapters.map((chapter, index) => (
               <option key={index} value={index}>
                 {chapter.heading}
               </option>
             ))}
             <option value={subChapters.length}>References</option>
             <option value={subChapters.length + 1}>Acknowledgements</option>
             <option value={subChapters.length + 2}>Authors</option>
           </select>
         </div>
       </header>
 
       <div className="flex flex-col gap-3 w-full max-w-4xl mx-auto my-16 min-h-40 relative">
         <main className="flex-grow overflow-y-auto p-6 flex flex-col gap-3 w-full max-w-4xl mx-auto">
           <h2 className="text-2xl font-bold mb-4 text-center">{currentContent.heading}</h2>
 
           {currentContent.subsections.map((subsection, index) => (
             <div key={index} className="w-full max-w-4xl mx-auto mb-6">
               <h3 className="text-xl font-semibold mb-2 text-center">{subsection.heading}</h3>
               {subsection.content.map((content, idx) =>
                 typeof content === 'string' ? (
                   <p key={idx} className="text-base mb-2 text-center">
                     {content}
                   </p>
                 ) : (
                   <img key={idx} src={content.src} alt={content.alt} className="w-full max-w-4xl mx-auto mb-4" />
                 )
               )}
             </div>
           ))}
         </main>
         <div className="fixed bottom-4 left-0 right-0 flex justify-between items-center px-8">
           <button
             className="p-4 bg-gray-800 text-white disabled:bg-gray-500 disabled:cursor-not-allowed"
             onClick={() => setCurrentChapterIndex(currentChapterIndex - 1)}
             disabled={currentChapterIndex === 0} // Disable if at the first section
           >
             Previous
           </button>
           <button
             className="p-4 bg-gray-800 text-white disabled:bg-gray-500 disabled:cursor-not-allowed"
             onClick={() => setCurrentChapterIndex(currentChapterIndex + 1)}
             disabled={currentChapterIndex === totalSections - 1} // Disable if at the last section
           >
             Next
           </button>
         </div>
       </div>
     </div>
   );
 };


export default TextbookView;
