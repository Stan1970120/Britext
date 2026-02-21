// ... existing imports

// ✅ Create Book (Modified to handle Dynamic Chapters and Headings)
export const createBook = async (req, res) => {
  try {
    const { title, description, category, author, estimatedPages } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Book title is required" });
    
    // ✨ NEW: Parse chapters from stringified JSON (FormData sends it as string)
    let parsedChapters = [];
    if (req.body.chapters) {
      try {
        parsedChapters = JSON.parse(req.body.chapters);
      } catch (e) {
        console.error("Chapter parse error:", e);
      }
    }

    const coverImagePath = req.file ? req.file.path : "";

    const newBook = new PublishBook({
      title,
      author: author || "Unknown Author",
      category: category || "Fiction",
      summary: description, 
      coverImage: coverImagePath,
      authorId: req.admin?.id || req.admin?._id || req.user?.id,
      status: 'draft',
      estimatedPages: estimatedPages || 1, // ✨ NEW: Save estimated pages
      // ✨ NEW: Map chapters to include headings
      chapters: parsedChapters.map((ch, index) => ({
        title: ch.title || `Chapter ${index + 1}`,
        heading: ch.heading || "",
        content: ch.content || "",
        order: index + 1
      })) 
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    console.error("Create Book Error:", err);
    res.status(500).json({ success: false, message: "Failed to create book draft" });
  }
};

// ✅ Update Chapters (Modified to support headings)
export const updateChapters = async (req, res) => {
  try {
    const { chapters, estimatedPages } = req.body;
    const { id } = req.params;

    // ✨ NEW: Ensure chapters preserve headings and titles during updates
    const formattedChapters = chapters.map((ch, index) => ({
      title: ch.title,
      heading: ch.heading,
      content: ch.content,
      order: index + 1
    }));

    const updatedBook = await PublishBook.findByIdAndUpdate(
      id, 
      { 
        chapters: formattedChapters,
        estimatedPages: estimatedPages 
      }, 
      { new: true }
    );

    if (!updatedBook) return res.status(404).json({ message: "Book not found" });
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: "Failed to save chapter content" });
  }
};

// ... keep other functions (getStats, getAdminBooks, getStoreBooks, etc.) as they were