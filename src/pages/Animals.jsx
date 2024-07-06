import { useState } from 'react';
import { useAnimals, useAddAnimal, useUpdateAnimal, useDeleteAnimal } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { supabase } from '../integrations/supabase';

const Animals = () => {
  const { data: animals, isLoading, isError } = useAnimals();
  const addAnimal = useAddAnimal();
  const updateAnimal = useUpdateAnimal();
  const deleteAnimal = useDeleteAnimal();

  const [editingAnimal, setEditingAnimal] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

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

  const openEditModal = (animal) => {
    setEditingAnimal(animal);
    reset(animal);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingAnimal(null);
    setIsEditModalOpen(false);
  };

  const openAddModal = () => {
    reset({});
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('animal-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('animal-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image: ', error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    try {
      let imageUrl = data.image_url;

      if (data.image && data.image[0]) {
        imageUrl = await uploadImage(data.image[0]);
        setValue('image_url', imageUrl); // Automatically set the image_url field
      }

      const animalData = {
        ...data,
        image_url: imageUrl,
      };

      if (editingAnimal) {
        await updateAnimal.mutateAsync({ id: editingAnimal.id, ...animalData });
        toast.success("Animal updated successfully");
        closeEditModal();
      } else {
        await addAnimal.mutateAsync(animalData);
        toast.success("Animal added successfully");
        closeAddModal();
      }
    } catch (error) {
      toast.error(editingAnimal ? "Failed to update animal" : "Failed to add animal");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Animals</h1>
        <Button onClick={openAddModal}>Add Animal</Button>
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
                <Button variant="outline" className="mr-2" onClick={() => openEditModal(animal)}>
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

      <Dialog open={isEditModalOpen || isAddModalOpen} onOpenChange={editingAnimal ? setIsEditModalOpen : setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAnimal ? 'Edit Animal' : 'Add Animal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && <p className="text-red-500 col-span-3 col-start-2">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="species" className="text-right">
                  Species
                </Label>
                <Input
                  id="species"
                  className="col-span-3"
                  {...register("species", { required: "Species is required" })}
                />
                {errors.species && <p className="text-red-500 col-span-3 col-start-2">{errors.species.message}</p>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image
                </Label>
                <Input
                  id="image"
                  type="file"
                  className="col-span-3"
                  {...register("image")}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image_url" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="image_url"
                  className="col-span-3"
                  {...register("image_url", { 
                    pattern: {
                      value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                      message: "Invalid URL format"
                    }
                  })}
                />
                {errors.image_url && <p className="text-red-500 col-span-3 col-start-2">{errors.image_url.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={editingAnimal ? closeEditModal : closeAddModal}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Animals;