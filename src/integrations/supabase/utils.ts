export const getImageUrl = (path: string | null) => {
  if (!path) return { publicUrl: null };
  
  const storageUrl = "https://swlqrejfgvmjajhtoall.supabase.co/storage/v1/object/public";
  return {
    publicUrl: `${storageUrl}/${path}`
  };
};