import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { ChevronRight, Smartphone } from "lucide-react";

export type UPIApp = {
  id: string;
  name: string;
  intentCode: string;
  icon: string;
};

export const UPI_APPS: UPIApp[] = [
  { id: "gpay", name: "Google Pay UPI", intentCode: "upi://pay", icon: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" },
  { id: "phonepe", name: "PhonePe UPI", intentCode: "upi://pay", icon: "https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" },
  { id: "paytm", name: "Paytm UPI", intentCode: "upi://pay", icon: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" },
  { id: "bhim", name: "BHIM UPI", intentCode: "upi://pay", icon: "https://upload.wikimedia.org/wikipedia/commons/1/14/BHIM_logo.svg" },
  { id: "amazon", name: "Amazon Pay UPI", intentCode: "upi://pay", icon: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" },
];

export const ANY_UPI: UPIApp = {
  id: "any", name: "Any UPI App", intentCode: "upi://pay", icon: ""
};

interface Props {
  selectedApp: UPIApp;
  onSelect: (app: UPIApp) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const UPISheet = ({ selectedApp, onSelect, open, onOpenChange, children }: Props) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="bg-white rounded-t-2xl max-h-[85vh]">
        <DrawerHeader className="text-left border-b border-border/40 pb-3">
          <DrawerTitle className="text-lg font-bold text-secondary">Pay by any UPI app</DrawerTitle>
        </DrawerHeader>
        
        <div className="p-4 overflow-y-auto pb-8 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 ps-2">Recommended</p>
          
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            {UPI_APPS.slice(0, 3).map((app, i) => (
              <DrawerClose key={app.id} asChild>
                <div 
                  onClick={() => onSelect(app)}
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors ${i !== 2 ? "border-b border-border/40" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-border/50 rounded flex items-center justify-center p-1 bg-white">
                      <img src={app.icon} alt={app.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="font-semibold text-base text-secondary">{app.name}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </DrawerClose>
            ))}
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-6 mb-3 ps-2">Pay by any UPI App</p>
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            {UPI_APPS.slice(3).map((app, i) => (
              <DrawerClose key={app.id} asChild>
                <div 
                  onClick={() => onSelect(app)}
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/40`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-border/50 rounded flex items-center justify-center p-1 bg-white">
                      <img src={app.icon} alt={app.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="font-semibold text-base text-secondary">{app.name}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </DrawerClose>
            ))}
            <DrawerClose asChild>
              <div 
                onClick={() => onSelect(ANY_UPI)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-border/50 rounded flex items-center justify-center p-2 bg-white">
                    <Smartphone className="w-full h-full text-secondary" />
                  </div>
                  <span className="font-semibold text-base text-secondary">Other UPI Apps</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
