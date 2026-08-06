interface CloudinaryUploadResponse {
  secure_url: string
}

export function useCloudinaryUpload() {
  const config = useRuntimeConfig()

  async function upload(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', config.public.cloudinaryUploadPreset)
    formData.append('folder', 'minerals')

    const response = await $fetch<CloudinaryUploadResponse>(
      `https://api.cloudinary.com/v1_1/${config.public.cloudinaryCloudName}/image/upload`,
      { method: 'POST', body: formData },
    )

    return response.secure_url
  }

  return { upload }
}
