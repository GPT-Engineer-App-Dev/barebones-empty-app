import { useState } from 'react';
import { useAnimals, useAddAnimal, useUpdateAnimal, useDeleteAnimal } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Animals = () => {
  const { data: animals, isLoading, isError } = useAnimals();
  const addAnimal = useAddAnimal();
  const updateAnimal = useUpdateAnimal();
  const deleteAnimal = useDeleteAnimal();

  const [editingAnimal, setEditingAnimal] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) return <div>Loading animals...</div>;
  if (isError) return <div>Error loading animals</div>;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const animalData = Object.fromEntries(formData.entries());

    try {
      if (editingAnimal) {
        await updateAnimal.mutateAsync({ id: editingAnimal.id, ...animalData });
        toast.success("Animal updated successfully");
      } else {
        await addAnimal.mutateAsync(animalData);
        toast.success("Animal added successfully");
      }
      setIsDialogOpen(false);
      setEditingAnimal(null);
    } catch (error) {
      toast.error(editingAnimal ? "Failed to update animal" : "Failed to add animal");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAnimal.mutateAsync(id);
      toast.success("Animal deleted successfully");
    } catch (error) {
      toast.error("Failed to delete animal");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Animals</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAnimal(null)}>Add Animal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAnimal ? 'Edit Animal' : 'Add New Animal'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editingAnimal?.name} required />
              </div>
              <div>
                <Label htmlFor="species">Species</Label>
                <Input id="species" name="species" defaultValue={editingAnimal?.species} required />
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input id="image_url" name="image_url" defaultValue={editingAnimal?.image_url} />
              </div>
              <Button type="submit">{editingAnimal ? 'Update' : 'Add'} Animal</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Species</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animals.map((animal) => (
            <TableRow key={animal.id}>
              <TableCell>{animal.name}</TableCell>
              <TableCell>{animal.species}</TableCell>
              <TableCell>
                {animal.image_url && (
                  <img src={animal.image_url} alt={animal.name} className="w-10 h-10 object-cover rounded-full" />
                )}
              </TableCell>
              <TableCell>
                <Button variant="outline" className="mr-2" onClick={() => {
                  setEditingAnimal(animal);
                  setIsDialogOpen(true);
                }}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(animal.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Animals;