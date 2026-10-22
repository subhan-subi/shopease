import api from "./api";

const mapCategory = (item) => ({
  ...item,
  id: (item._id || item.id || item.firebaseId || "").toString(),
  firebaseId: (item._id || item.id || item.firebaseId || "").toString(),
});

// GET ALL CATEGORIES
export async function getCategories() {
  const response = await api.get("/categories");
  const data = response.data.data || [];
  return data.map(mapCategory);
}

// ADD CATEGORY
export async function addCategory(category) {
  const response = await api.post("/categories", category);
  return mapCategory(response.data.data);
}

// UPDATE SINGLE CATEGORY
export async function updateCategory(id, updatedData) {
  const response = await api.put(`/categories/${id}`, updatedData);
  return mapCategory(response.data.data);
}

// DELETE SINGLE CATEGORY
export async function deleteCategory(id) {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
}

// BATCH UPDATE ENTIRE BRANCH
export async function updateCategoryBranch(itemsToUpdate, updatedFields) {
  const response = await api.put("/categories/branch/update", {
    itemsToUpdate,
    updatedFields,
  });
  return response.data;
}

// BATCH DELETE ENTIRE BRANCH
export async function deleteCategoryBranch(itemsToDelete) {
  const response = await api.post("/categories/branch/delete", {
    itemsToDelete,
  });
  return response.data;
}
