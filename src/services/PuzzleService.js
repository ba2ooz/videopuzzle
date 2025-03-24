export class PuzzleService {
  constructor() {
    this.puzzles = [
      {
        id: 1,
        authorName:"Attila Pergel",
        authorProfileUrl:"https://pixabay.com/users/attilapergel-17025299/",
        imgUrl: "/images/1.png",
        videoUrl: "https://cdn.pixabay.com/video/2023/06/21/168271-838656574_tiny.mp4"
      },
      {
        id: 2,
        authorName:"Matthias Groeneveld",
        authorProfileUrl:"https://pixabay.com/users/matthias_groeneveld-4535957/",
        imgUrl: "/images/2.png",
        videoUrl: "https://cdn.pixabay.com/video/2024/03/10/203678-922748476_tiny.mp4",
      },
      {
        id: 3,
        authorName:"Andreas",
        authorProfileUrl:"https://pixabay.com/users/adege-4994132/",
        imgUrl: "/images/3.png",
        videoUrl: "https://cdn.pixabay.com/video/2025/02/23/260397_tiny.mp4",
      },
      {
        id: 4,
        authorName:"Joshua Woroniecki",
        authorProfileUrl:"https://pixabay.com/users/joshuaworoniecki-12734309/",
        imgUrl: "/images/4.png",
        videoUrl: "https://cdn.pixabay.com/video/2024/02/24/201766-916357972_tiny.mp4"
      },
      {
        id: 5,
        authorName:"Martin Grabo",
        authorProfileUrl:"https://pixabay.com/users/martin_grabo-25750775/",
        imgUrl: "/images/5.png",
        videoUrl: "https://cdn.pixabay.com/video/2023/06/22/168396-839215134_tiny.mp4"
      },
      {
        id: 6,
        authorName:"Kmeel_com",
        authorProfileUrl:"https://pixabay.com/users/kmeel_com-5075826/",
        imgUrl: "/images/6.png",
        videoUrl: "https://cdn.pixabay.com/video/2021/08/28/86628-594416689_tiny.mp4"
      }
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
