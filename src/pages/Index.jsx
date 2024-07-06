import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-10">
          <h1 className="text-3xl font-bold mb-2">Welcome to Barebones App</h1>
          <p className="text-muted-foreground">Your journey starts here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;