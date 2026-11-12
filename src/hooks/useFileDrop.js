import { useEffect, useRef, useState } from "react";

// True when the drag carries files (not text or a link dragged from the page).
function isFileDrag(e) {
    return Array.from(e.dataTransfer?.types ?? []).includes("Files");
}

/**
 * Drag-and-drop for one file. Spread `dropProps` on the drop zone; `isDragging`
 * is true while a file is held over it. Only the first dropped file is passed
 * to onFile. While `disabled`, drops are refused (and nothing is highlighted).
 *
 * While a drop zone is on the page, a file dropped anywhere else is ignored
 * instead of the browser navigating away to open it.
 */
export default function useFileDrop({ onFile, disabled = false }) {
    const [isDragging, setIsDragging] = useState(false);
    // dragenter/dragleave also fire when moving between the zone's children, so
    // count them: the drag has only left once every enter has a matching leave.
    const depth = useRef(0);

    const reset = () => {
        depth.current = 0;
        setIsDragging(false);
    };

    useEffect(() => {
        // The zone's own handlers run first and call preventDefault; anything
        // still unhandled when it reaches the window was dropped outside it.
        const refuse = (e) => {
            if (!isFileDrag(e) || e.defaultPrevented) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "none";
        };
        const refuseDrop = (e) => {
            depth.current = 0;
            setIsDragging(false);
            if (!isFileDrag(e) || e.defaultPrevented) return;
            e.preventDefault();
        };
        window.addEventListener("dragover", refuse);
        window.addEventListener("drop", refuseDrop);
        return () => {
            window.removeEventListener("dragover", refuse);
            window.removeEventListener("drop", refuseDrop);
        };
    }, []);

    const dropProps = {
        onDragEnter: (e) => {
            if (!isFileDrag(e)) return;
            e.preventDefault();
            depth.current += 1;
            setIsDragging(true);
        },
        onDragOver: (e) => {
            if (!isFileDrag(e)) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = disabled ? "none" : "copy";
        },
        onDragLeave: (e) => {
            if (!isFileDrag(e)) return;
            depth.current = Math.max(0, depth.current - 1);
            if (depth.current === 0) setIsDragging(false);
        },
        onDrop: (e) => {
            if (!isFileDrag(e)) return;
            e.preventDefault();
            reset();
            const file = e.dataTransfer.files?.[0];
            if (file && !disabled) onFile(file);
        },
    };

    return { isDragging: isDragging && !disabled, dropProps };
}
