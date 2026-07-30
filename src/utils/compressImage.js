// Image ko resize + compress karke data URL banao
// Firestore doc ki limit 1MB hai, isliye image chhoti karni zaroori hai
export const fileToCompressedDataUrl = (file, maxWidth = 1000, quality = 0.72) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/'))
      return reject(new Error('Sirf image file chuno (JPG/PNG)'))

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale  = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)

      let dataUrl = canvas.toDataURL('image/jpeg', quality)
      // Phir bhi badi hai to aur zyada compress karo
      if (dataUrl.length > 900_000) dataUrl = canvas.toDataURL('image/jpeg', 0.5)
      if (dataUrl.length > 900_000)
        return reject(new Error('Image bahut badi hai — chhoti image try karo'))
      resolve(dataUrl)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Image load nahi hui — dusri file try karo'))
    }
    img.src = objectUrl
  })
