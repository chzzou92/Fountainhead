"use client";

import { useEffect, useRef, useState } from "react";

// Standard US Letter page: 8.5" x 11" at 96 DPI
// 1 inch = 96px
// Page height: 11" = 1056px
// But we need to account for margins: 1" top + 1" bottom = 2" = 192px
// Content height per page: 1056px - 192px = 864px
const PAGE_CONTENT_HEIGHT = 864; // 9 inches of content per page (11" - 1" top - 1" bottom)
const PAGE_SPACING = 40; // Space between pages

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const updatePageCount = () => {
      const content = contentRef.current;
      if (!content) return;

      // Wait for content to render
      setTimeout(() => {
        // Find the actual content editable area
        const editableArea = content.querySelector('[contenteditable="true"]');
        if (!editableArea) {
          setPageCount(1);
          return;
        }

        const editableElement = editableArea as HTMLElement;

        // Get the total height of the content including padding
        // The content area has 1" top padding (96px) and 1" bottom padding (96px)
        // We need to measure the actual content height
        // Get the total scroll height of the content
        const contentHeight = editableElement.scrollHeight;
        const clientHeight = editableElement.clientHeight;
        const offsetHeight = editableElement.offsetHeight;

        // console.log("PageWrapper Debug:", {
        //   contentHeight,
        //   clientHeight,
        //   offsetHeight,
        //   PAGE_CONTENT_HEIGHT,
        //   calculatedPages: Math.ceil(contentHeight / PAGE_CONTENT_HEIGHT),
        // });

        // The content area has 1" top padding (96px), so actual content starts after that
        // We measure from the scrollHeight which includes all content
        // Each page can hold PAGE_CONTENT_HEIGHT (864px) of content before hitting the 1" bottom margin
        const pages = Math.max(
          1,
          Math.ceil(contentHeight / PAGE_CONTENT_HEIGHT)
        );

        // console.log("PageWrapper: Setting page count to", pages);
        setPageCount(pages);
      }, 300);
    };

    // Update on content changes
    const observer = new MutationObserver(() => {
      updatePageCount();
    });

    const content = contentRef.current;
    if (content) {
      observer.observe(content, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
      updatePageCount();
    }

    // Also update on window resize
    window.addEventListener("resize", updatePageCount);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePageCount);
    };
  }, []);

  return (
    <div className="page-container-wrapper">
      <div ref={contentRef} className="page-content-area">
        {children}
      </div>
      {/* Render page overlays for page numbers */}
      {/* Title page (index 0) and first page of script (index 1) should not have page numbers */}
      {Array.from({ length: pageCount }).map((_, index) => {
        // Page numbers start from page 3 (index 2), so page 1 and 2 don't have numbers
        const pageNumber = index + 1;
        const shouldShowPageNumber = pageNumber > 2;

        // Calculate position: each page is PAGE_CONTENT_HEIGHT (864px) + 1" top (96px) + 1" bottom (96px) = 1056px
        // Plus spacing between pages
        const pageTop = index * (PAGE_CONTENT_HEIGHT + 192 + PAGE_SPACING) + 20; // 20px = container padding

        console.log(`PageWrapper: Rendering page ${pageNumber}`, {
          index,
          pageTop,
          shouldShowPageNumber,
          height: PAGE_CONTENT_HEIGHT + 192,
        });

        return (
          <div
            key={index}
            className="page-overlay"
            style={{
              top: `${pageTop}px`,
              height: `${PAGE_CONTENT_HEIGHT + 192}px`, // Full page height: 864px content + 96px top + 96px bottom
            }}
          >
            {shouldShowPageNumber && (
              <div className="page-number">{pageNumber}</div>
            )}
            {/* Debug indicator - remove after debugging */}
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                fontSize: "10px",
                color: "#999",
                padding: "2px 4px",
                background: "rgba(255,255,255,0.8)",
                zIndex: 10,
              }}
            >
              Page {pageNumber}{" "}
              {shouldShowPageNumber ? "(numbered)" : "(no number)"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
