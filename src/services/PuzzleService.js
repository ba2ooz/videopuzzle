export class PuzzleService {
  constructor() {
    this.puzzles = [
      {
        id: 1,
        title: "Title 1",
        description: "",
        difficulty: "medium",
        videoUrl: "https://cdn.pixabay.com/video/2024/03/18/204565-924698132_tiny.mp4",
        completionTime: "10-15 min",
      },
      {
        id: 2,
        title: "Title 2",
        description: "",
        difficulty: "easy",
        videoUrl: "https://cdn.pixabay.com/video/2024/12/29/249475_tiny.mp4",
        completionTime: "5-10 min",
      },
      {
        id: 3,
        title: "Title 3",
        description: "",
        difficulty: "easy",
        videoUrl: "https://cdn.pixabay.com/video/2024/05/25/213616.mp4",
        completionTime: "5-8 min",
      },
      {
        id: 4,
        title: "Title 4",
        description: "",
        difficulty: "hard",
        videoUrl: "https://cdn.pixabay.com/video/2019/02/28/21723-320725678_medium.mp4",
        completionTime: "15-20 min",
      },
      {
        id: 5,
        title: "Title 5",
        description: "",
        difficulty: "hard",
        videoUrl: "https://cdn.pixabay.com/video/2023/11/28/191159-889246512_tiny.mp4",
        completionTime: "20-25 min",
      },
      {
        id: 6,
        title: "Title 6",
        description: "",
        difficulty: "medium",
        videoUrl: "https://cdn.pixabay.com/video/2024/06/11/216199_tiny.mp4",
        completionTime: "8-12 min",
      },
    ];
  }

  // Get all puzzles
  getAllPuzzles() {
    return this.puzzles;
  }

  // Get puzzle by ID
  getPuzzleById(id) {
    return this.puzzles.find((p) => p.id === parseInt(id));
  }
}
