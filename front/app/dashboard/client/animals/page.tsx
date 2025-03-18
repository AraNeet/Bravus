"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  Cat,
  Dog,
  Bird,
  Fish,
  Rabbit,
  Turtle,
  HelpCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/hooks/useAuth";
import type { Animal } from "@/app/api/types";
import { createAnimal, updateAnimal, deleteAnimal, getAnimalsByClientId } from "@/app/api/animals";
import { getUserIdFromToken } from "@/app/utils/jwt-utils";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Species options with icons
const speciesOptions = [
  { value: "dog", label: "Dog", icon: Dog },
  { value: "cat", label: "Cat", icon: Cat },
  { value: "bird", label: "Bird", icon: Bird },
  { value: "fish", label: "Fish", icon: Fish },
  { value: "rabbit", label: "Rabbit", icon: Rabbit },
  { value: "turtle", label: "Turtle", icon: Turtle },
  { value: "other", label: "Other", icon: HelpCircle },
];

// Get icon component for a species
const getSpeciesIcon = (species: string) => {
  const option = speciesOptions.find(
    (opt) => opt.value === species.toLowerCase()
  );
  const IconComponent = option?.icon || HelpCircle;
  return <IconComponent className="w-5 h-5" />;
};

// Animal form interface
interface AnimalFormData {
  AnimalName: string;
  AnimalRace: string;
  AnimalAge: number;
  species: string;
  color: string;
  weight: string;
  gender: string;
  notes: string;
}

// Empty form data
const emptyFormData: AnimalFormData = {
  AnimalName: "",
  AnimalRace: "",
  AnimalAge: 0,
  species: "",
  color: "",
  weight: "",
  gender: "",
  notes: "",
};

export default function AnimalsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // State for animal form
  const [formData, setFormData] = useState<AnimalFormData>(emptyFormData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof AnimalFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);
  const currentAnimals = filteredAnimals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Load animals when user data is available
  useEffect(() => {
    const fetchAnimals = async () => {
      if (!authLoading && user) {
        try {
          // Get client ID from the user
          const clientId = user.id;
          // Fetch animals for this client
          const clientAnimals = await getAnimalsByClientId(clientId);
          setAnimals(clientAnimals);
          setFilteredAnimals(clientAnimals);
        } catch (error) {
          console.error("Error fetching animals:", error);
          toast.error("Failed to load animals");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAnimals();
  }, [user, authLoading]);

  // Filter animals when search query or active tab changes
  useEffect(() => {
    if (animals.length > 0) {
      let filtered = [...animals];

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (animal) =>
            animal["animal_name"].toLowerCase().includes(query) ||
            animal["animal_race"].toLowerCase().includes(query) ||
            (animal.metadata &&
              JSON.parse(animal.metadata).color?.toLowerCase().includes(query))
        );
      }

      // Apply tab filter
      if (activeTab !== "all") {
        filtered = filtered.filter(
          (animal) => animal.species?.toLowerCase() === activeTab
        );
      }

      setFilteredAnimals(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [searchQuery, activeTab, animals]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Convert age to number if it's the age field
    if (name === "AnimalAge") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : Number.parseInt(value, 10),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field when user types
    if (formErrors[name as keyof AnimalFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (formErrors[name as keyof AnimalFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AnimalFormData, string>> = {};

    if (!formData.AnimalName.trim()) {
      errors.AnimalName = "Name is required";
    }

    if (!formData.AnimalRace.trim()) {
      errors.AnimalRace = "Breed is required";
    }

    if (formData.AnimalAge <= 0) {
      errors.AnimalAge = "Age must be greater than 0";
    }

    if (!formData.species) {
      errors.species = "Species is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission for adding a new animal
  const handleAddAnimal = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        setApiError("Authentication error. Please log in again.");
        return;
      }

      // Create animal data for API
      const animalData = {
        "animal-name": formData.AnimalName,
        "animal-race": formData.AnimalRace,
        "animal-age": formData.AnimalAge,
        species: formData.species,
        metadata: JSON.stringify({
          color: formData.color,
          weight: formData.weight,
          gender: formData.gender,
          notes: formData.notes,
        }),
      };

      // Log the request data for debugging
      console.log("Sending animal data:", animalData);

      // Call API to create animal
      const newAnimal = await createAnimal(userId, animalData);

      // Log the response for debugging
      console.log("Received response:", newAnimal);

      // Update local state
      setAnimals((prev) => [...prev, newAnimal]);

      // Show success message with sonner
      toast.success("Animal Added", {
        description: `${formData.AnimalName} has been added successfully.`,
      });

      // Close dialog and reset form
      setIsAddDialogOpen(false);
      setFormData(emptyFormData);
    } catch (error: any) {
      console.error("Failed to add animal:", error);
      setApiError(
        error.message ||
          "An error occurred while adding the animal. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog and populate form with animal data
  const handleEditClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    setApiError(null);

    // Extract metadata if it exists
    let metadata = {};
    if (animal.metadata) {
      try {
        metadata = JSON.parse(animal.metadata);
      } catch (e) {
        console.error("Error parsing animal metadata:", e);
      }
    }

    setFormData({
      AnimalName: animal["animal_name"],
      AnimalRace: animal["animal_race"],
      AnimalAge: animal["animal_age"],
      species: animal.species || "",
      color: (metadata as any).color || "",
      weight: (metadata as any).weight || "",
      gender: (metadata as any).gender || "",
      notes: (metadata as any).notes || "",
    });

    setIsEditDialogOpen(true);
  };

  // Handle form submission for updating an animal
  const handleUpdateAnimal = async () => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      if (!selectedAnimal || !validateForm()) return;

      // Prepare metadata object for additional fields
      const metadata = {
        color: formData.color,
        weight: formData.weight,
        gender: formData.gender,
        notes: formData.notes,
      };

      // Prepare animal data for API
      const animalData = {
        "animal-name": formData.AnimalName,
        "animal-race": formData.AnimalRace,
        "animal-age": formData.AnimalAge,
        species: formData.species,
        metadata: JSON.stringify(metadata),
      };

      // Call the API to update the animal
      const updatedAnimal = await updateAnimal(selectedAnimal.id, animalData);

      // Update the local state
      setAnimals((prev) =>
        prev.map((animal) =>
          animal.id === selectedAnimal.id ? updatedAnimal : animal
        )
      );

      // Close the dialog and reset the form
      setIsEditDialogOpen(false);
      setFormData(emptyFormData);
      setSelectedAnimal(null);
      toast.success("Animal updated successfully");
    } catch (error) {
      console.error("Error updating animal:", error);
      setApiError("Failed to update animal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsDeleteDialogOpen(true);
  };

  // Handle animal deletion
  const handleDeleteAnimal = async () => {
    setIsSubmitting(true);

    try {
      if (!selectedAnimal) return;

      // Call the API to delete the animal
      await deleteAnimal(selectedAnimal.id);

      // Update the local state
      setAnimals((prev) =>
        prev.filter((animal) => animal.id !== selectedAnimal.id)
      );

      // Close the dialog
      setIsDeleteDialogOpen(false);
      setSelectedAnimal(null);
      toast.success("Animal deleted successfully");
    } catch (error) {
      console.error("Error deleting animal:", error);
      toast.error("Failed to delete animal");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialogs close
  useEffect(() => {
    if (!isAddDialogOpen && !isEditDialogOpen) {
      setFormData(emptyFormData);
      setFormErrors({});
      setApiError(null);
    }
  }, [isAddDialogOpen, isEditDialogOpen]);

  // Extract metadata from animal
  const getAnimalMetadata = (animal: Animal) => {
    if (!animal.metadata) return {};
    try {
      return JSON.parse(animal.metadata);
    } catch (e) {
      console.error("Error parsing animal metadata:", e);
      return {};
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-spink animate-spin mb-4" />
        <p className="text-white/70">Loading your animals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/client"
              className="text-white/70 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold mb-1">My Pets</h1>
          <p className="text-white/70">Manage your animal profiles</p>
        </div>

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="w-full md:w-auto bg-spink hover:bg-mred text-navy font-medium transition-all duration-300 shadow-lg shadow-spink/10 hover:shadow-mred/20 hover:scale-[1.02] active:scale-[0.98] rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Pet
        </Button>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
          <Input
            placeholder="Search by name, breed, or color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-navy/40 border-spink/10 focus:border-spink/40 focus:ring-spink/30"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full sm:w-auto bg-navy/40 border border-white/10 rounded-lg">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-spink/20 data-[state=active]:text-spink data-[state=active]:shadow-none"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="dog"
              className="flex items-center gap-1 data-[state=active]:bg-spink/20 data-[state=active]:text-spink data-[state=active]:shadow-none"
            >
              <Dog className="w-4 h-4 text-white/70" />
              <span className="hidden text-white/70 md:inline">Dogs</span>
            </TabsTrigger>
            <TabsTrigger
              value="cat"
              className="flex items-center gap-1 data-[state=active]:bg-spink/20 data-[state=active]:text-spink data-[state=active]:shadow-none"
            >
              <Cat className="w-4 h-4 text-white/70" />
              <span className="hidden text-white/70 md:inline">Cats</span>
            </TabsTrigger>
            <TabsTrigger
              value="other"
              className="flex items-center gap-1 data-[state=active]:bg-spink/20 data-[state=active]:text-spink data-[state=active]:shadow-none"
            >
              <HelpCircle className="w-4 h-4 text-white/70" />
              <span className="hidden text-white/70 md:inline">Other</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Animal list */}
      {filteredAnimals.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentAnimals.map((animal) => {
              const metadata = getAnimalMetadata(animal);
              const species = animal.species || "other";

              return (
                <Card
                  key={animal.id}
                  className="overflow-hidden bg-navy/40 backdrop-blur-sm border-spink/10 hover:border-spink/20 transition-all duration-300 hover:shadow-lg hover:shadow-spink/5"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="bg-spink/10 p-2 rounded-full text-spink">
                          {getSpeciesIcon(species)}
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {animal["animal_name"]}
                          </CardTitle>
                          <CardDescription className="text-white/60">
                            {animal["animal_race"]}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-spink/10 text-spink border-spink/20"
                      >
                        {animal["animal_age"]}{" "}
                        {animal["animal_age"] === 1 ? "year" : "years"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {metadata.color && (
                        <div>
                          <span className="text-white/60">Color:</span>{" "}
                          {metadata.color}
                        </div>
                      )}
                      {metadata.weight && (
                        <div>
                          <span className="text-white/60">Weight:</span>{" "}
                          {metadata.weight}
                        </div>
                      )}
                      {metadata.gender && (
                        <div>
                          <span className="text-white/60">Gender:</span>{" "}
                          {metadata.gender}
                        </div>
                      )}
                    </div>

                    {metadata.notes && (
                      <div className="mt-2 text-sm">
                        <span className="text-white/60">Notes:</span>
                        <p className="line-clamp-2 text-white/80">
                          {metadata.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex justify-between pt-2 border-t border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(animal)}
                      className="text-white/70 hover:text-spink hover:bg-spink/10"
                    >
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(animal)}
                      className="text-white/70 hover:text-mred hover:bg-mred/10"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-navy/40 border-spink/10 text-white hover:bg-spink/10 hover:text-white hover:border-spink/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-sm text-white/70">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="bg-navy/40 border-spink/10 text-white hover:bg-spink/10 hover:text-white hover:border-spink/20"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-8 text-center">
          <div className="flex justify-center mb-4">
            {activeTab === "all" ? (
              <HelpCircle className="w-12 h-12 text-white/40" />
            ) : (
              <div className="text-spink">{getSpeciesIcon(activeTab)}</div>
            )}
          </div>
          <h3 className="text-lg font-medium mb-2">No pets found</h3>
          <p className="text-white/60 mb-4">
            {searchQuery
              ? "No pets match your search criteria. Try a different search term."
              : activeTab !== "all"
              ? `You don't have any ${activeTab}s in your profile yet.`
              : "You haven't added any pets to your profile yet."}
          </p>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-spink hover:bg-mred text-navy font-medium transition-colors rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Pet
          </Button>
        </div>
      )}

      {/* Add Animal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-navy border-spink/20 text-white">
          <DialogHeader>
            <DialogTitle>Add New Pet</DialogTitle>
            <DialogDescription className="text-white/60">
              Enter your pet's information below. Required fields are marked
              with an asterisk (*).
            </DialogDescription>
          </DialogHeader>

          {apiError && (
            <div className="bg-mred/20 border border-mred/50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-mred flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white">{apiError}</p>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="AnimalName" className="text-white/80">
                  Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="AnimalName"
                  name="AnimalName"
                  value={formData.AnimalName}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  className={`bg-white/5 border-[#9f6eff]/20 text-white placeholder:text-white/40 focus:border-[#9f6eff]/40 ${
                    formErrors.AnimalName ? "border-red-500" : ""
                  }`}
                />
                {formErrors.AnimalName && (
                  <p className="text-red-400 text-xs">
                    {formErrors.AnimalName}
                  </p>
                )}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="AnimalAge" className="text-white/80">
                  Age (years) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="AnimalAge"
                  name="AnimalAge"
                  type="number"
                  min="0"
                  value={formData.AnimalAge || ""}
                  onChange={handleInputChange}
                  placeholder="Enter age"
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 ${
                    formErrors.AnimalAge ? "border-red-500" : ""
                  }`}
                />
                {formErrors.AnimalAge && (
                  <p className="text-red-400 text-xs">{formErrors.AnimalAge}</p>
                )}
              </div>
            </div>

            {/* Species */}
            <div className="space-y-2">
              <Label htmlFor="species" className="text-white/80">
                Species <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.species}
                onValueChange={(value) => handleSelectChange("species", value)}
              >
                <SelectTrigger
                  id="species"
                  className={`bg-white/5 border-[#9f6eff]/20 text-white focus:ring-[#9f6eff]/30 ${
                    formErrors.species ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-br from-[#1a0b2e] to-[#2c1250] border-[#9f6eff]/20 text-white">
                  {speciesOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.species && (
                <p className="text-red-400 text-xs">{formErrors.species}</p>
              )}
            </div>

            {/* Breed */}
            <div className="space-y-2">
              <Label htmlFor="AnimalRace" className="text-white/80">
                Breed <span className="text-red-400">*</span>
              </Label>
              <Input
                id="AnimalRace"
                name="AnimalRace"
                value={formData.AnimalRace}
                onChange={handleInputChange}
                placeholder="Enter breed"
                className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 ${
                  formErrors.AnimalRace ? "border-red-500" : ""
                }`}
              />
              {formErrors.AnimalRace && (
                <p className="text-red-400 text-xs">{formErrors.AnimalRace}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color" className="text-white/80">
                  Color
                </Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Enter color"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-white/80">
                  Weight
                </Label>
                <Input
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 15 lbs"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-white/80">
                Gender
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger
                  id="gender"
                  className="bg-white/5 border-white/10 text-white"
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0b2e] border-white/10 text-white">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white/80">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional information about your pet"
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="bg-navy/60 border-white/10 text-white hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAnimal}
              disabled={isSubmitting}
              className="bg-spink hover:bg-mred text-navy font-medium transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Pet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Animal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-navy border-spink/20 text-white">
          <DialogHeader>
            <DialogTitle>Edit Pet</DialogTitle>
            <DialogDescription className="text-white/60">
              Update your pet's information below.
            </DialogDescription>
          </DialogHeader>

          {apiError && (
            <div className="bg-mred/20 border border-mred/50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-mred flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white">{apiError}</p>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-AnimalName" className="text-white/80">
                  Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit-AnimalName"
                  name="AnimalName"
                  value={formData.AnimalName}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  className={`bg-white/5 border-[#9f6eff]/20 text-white placeholder:text-white/40 focus:border-[#9f6eff]/40 ${
                    formErrors.AnimalName ? "border-red-500" : ""
                  }`}
                />
                {formErrors.AnimalName && (
                  <p className="text-red-400 text-xs">
                    {formErrors.AnimalName}
                  </p>
                )}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="edit-AnimalAge" className="text-white/80">
                  Age (years) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit-AnimalAge"
                  name="AnimalAge"
                  type="number"
                  min="0"
                  value={formData.AnimalAge || ""}
                  onChange={handleInputChange}
                  placeholder="Enter age"
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 ${
                    formErrors.AnimalAge ? "border-red-500" : ""
                  }`}
                />
                {formErrors.AnimalAge && (
                  <p className="text-red-400 text-xs">{formErrors.AnimalAge}</p>
                )}
              </div>
            </div>

            {/* Species */}
            <div className="space-y-2">
              <Label htmlFor="edit-species" className="text-white/80">
                Species <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.species}
                onValueChange={(value) => handleSelectChange("species", value)}
              >
                <SelectTrigger
                  id="edit-species"
                  className={`bg-white/5 border-[#9f6eff]/20 text-white focus:ring-[#9f6eff]/30 ${
                    formErrors.species ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-br from-[#1a0b2e] to-[#2c1250] border-[#9f6eff]/20 text-white">
                  {speciesOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.species && (
                <p className="text-red-400 text-xs">{formErrors.species}</p>
              )}
            </div>

            {/* Breed */}
            <div className="space-y-2">
              <Label htmlFor="edit-AnimalRace" className="text-white/80">
                Breed <span className="text-red-400">*</span>
              </Label>
              <Input
                id="edit-AnimalRace"
                name="AnimalRace"
                value={formData.AnimalRace}
                onChange={handleInputChange}
                placeholder="Enter breed"
                className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 ${
                  formErrors.AnimalRace ? "border-red-500" : ""
                }`}
              />
              {formErrors.AnimalRace && (
                <p className="text-red-400 text-xs">{formErrors.AnimalRace}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="edit-color" className="text-white/80">
                  Color
                </Label>
                <Input
                  id="edit-color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Enter color"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="edit-weight" className="text-white/80">
                  Weight
                </Label>
                <Input
                  id="edit-weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 15 lbs"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="edit-gender" className="text-white/80">
                Gender
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger
                  id="edit-gender"
                  className="bg-white/5 border-white/10 text-white"
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0b2e] border-white/10 text-white">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="edit-notes" className="text-white/80">
                Notes
              </Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional information about your pet"
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-navy/60 border-white/10 text-white hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAnimal}
              disabled={isSubmitting}
              className="bg-spink hover:bg-mred text-navy font-medium transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Update Pet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-navy border-spink/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pet</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">
                {selectedAnimal?.animal_name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-navy/60 border-white/10 text-white hover:bg-white/10 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAnimal}
              disabled={isSubmitting}
              className="bg-mred hover:bg-mred/80 text-white hover:text-white border-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
