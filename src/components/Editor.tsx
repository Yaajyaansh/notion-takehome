import { useState } from "react";
import { Block } from "@/types/editor";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ChecklistBlock } from "./blocks/ChecklistBlock";
import { Button } from "./ui/button";
import { Type, Image, CheckSquare, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "./ui/use-toast";

export const Editor = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  const addBlock = (type: Block["type"]) => {
    const newBlock: Block = (() => {
      switch (type) {
        case "text":
          return {
            id: crypto.randomUUID(),
            type: "text",
            content: "",
            style: "p",
          };
        case "image":
          return {
            id: crypto.randomUUID(),
            type: "image",
            src: "",
            width: 0,
            height: 0,
          };
        case "checklist":
          return {
            id: crypto.randomUUID(),
            type: "checklist",
            items: [],
          };
        default:
          throw new Error(`Unsupported block type: ${type}`);
      }
    })();

    setBlocks([...blocks, newBlock]);
    saveBlocks([...blocks, newBlock]);
  };

  const updateBlock = (updatedBlock: Block) => {
    const newBlocks = blocks.map((block) =>
      block.id === updatedBlock.id ? updatedBlock : block
    );
    setBlocks(newBlocks);
    
    // Only save blocks when text editing is complete
    if (updatedBlock.type === "image") {
      saveBlocks(newBlocks);
    }
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    
    setBlocks(newBlocks);
    saveBlocks(newBlocks);
  };

  const deleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
    saveBlocks(newBlocks);
  };

  const saveBlocks = async (blocksToSave: Block[]) => {
    try {
      localStorage.setItem("blocks", JSON.stringify(blocksToSave));
      toast({
        title: "Changes saved",
        description: "Your content has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving changes",
        description: "There was a problem saving your content.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-24 z-50 mb-16">
        <div className="flex items-center justify-center gap-4 rounded-xl bg-white/90 backdrop-blur-sm p-3 shadow-lg border border-border/40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addBlock("text")}
            className="flex flex-col items-center gap-1 h-auto px-3 py-2 hover:bg-accent/50 hover:scale-105 transition-all duration-200"
          >
            <Type className="h-5 w-5" />
            <span className="text-xs font-medium">Text</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addBlock("image")}
            className="flex flex-col items-center gap-1 h-auto px-3 py-2 hover:bg-accent/50 hover:scale-105 transition-all duration-200"
          >
            <Image className="h-5 w-5" />
            <span className="text-xs font-medium">Image</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addBlock("checklist")}
            className="flex flex-col items-center gap-1 h-auto px-3 py-2 hover:bg-accent/50 hover:scale-105 transition-all duration-200"
          >
            <CheckSquare className="h-5 w-5" />
            <span className="text-xs font-medium">Checklist</span>
          </Button>
        </div>
      </div>

      <div className="space-y-8 p-8">
        {blocks.map((block, index) => (
          <div key={block.id} className="group relative">
            <div className="absolute -left-20 top-2 hidden space-y-2 group-hover:block">
              <Button
                variant="outline"
                size="icon"
                onClick={() => moveBlock(index, "up")}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => moveBlock(index, "down")}
                disabled={index === blocks.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            {block.type === "text" ? (
              <TextBlock
                block={block}
                onChange={(updatedBlock) => {
                  updateBlock(updatedBlock);
                  saveBlocks(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
                }}
                onDelete={() => deleteBlock(index)}
              />
            ) : block.type === "image" ? (
              <ImageBlock
                block={block}
                onChange={updateBlock}
                onDelete={() => deleteBlock(index)}
              />
            ) : (
              <ChecklistBlock
                block={block}
                onChange={updateBlock}
                onDelete={() => deleteBlock(index)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};