import { useState } from 'react';
import { useAnimals, useAddAnimal, useUpdateAnimal, useDeleteAnimal } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const Animals = () => {
  const { data: animals, isLoading, isError } = useAnimals();
  const addAnimal = useAddAnimal();
  const updateAnimal = useUpdateAnimal();
  const deleteAnimal = useDeleteAnimal();

  const [editingAnimal, setEditingAnimal] = useState(null);

  if (isLoading) return <div>Loading animals...</div>;
  if (isError) return <div>Error loading animals</div>;

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
      <h1 className="text-2xl font-bold mb-5">Animals</h1>
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
                <Button variant="outline" className="mr-2" onClick={() => setEditingAnimal(animal)}>
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