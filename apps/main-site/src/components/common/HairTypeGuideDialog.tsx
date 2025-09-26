
"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpenText } from "lucide-react"; // Changed for better icon

const HairTypeGuideDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm" className="mb-4 text-sm">
        <BookOpenText className="mr-2 h-4 w-4" />
        Hair Type Guide
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-primary">Understanding Your Hair Type</DialogTitle>
        <DialogDescription>
          Find the best Glamour Locks products by understanding your hair's unique needs.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 text-sm">
        <div>
          <h4 className="font-semibold text-foreground">Straight Hair </h4>
          <p className="text-muted-foreground">Often resilient and shiny, can range from fine to coarse. Tends to get oily faster than other types. Benefits from lightweight, volumizing products that don't weigh it down.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Wavy Hair </h4>
          <p className="text-muted-foreground">Forms an 'S' shape. Can be fine, medium, or coarse. Prone to frizz. Needs moisture and products that enhance definition without sacrificing volume.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Curly Hair </h4>
          <p className="text-muted-foreground">Defined loops or corkscrews. Often voluminous but can be prone to dryness and frizz. Requires ample moisture, curl-defining creams, and gels for hold.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Coily/Kinky Hair </h4>
          <p className="text-muted-foreground">Tightly coiled, zig-zag, or no discernible pattern. Very fragile and prone to shrinkage and dryness. Requires rich, moisturizing butters, creams, and oils.</p>
        </div>
         <p className="text-xs text-muted-foreground pt-2">Note: This is a simplified guide. Many people have a combination of hair types!</p>
      </div>
    </DialogContent>
  </Dialog>
);
export default HairTypeGuideDialog;
