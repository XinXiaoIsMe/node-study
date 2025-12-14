import { inject, injectable } from "inversify";
import { IPostRepository, IPostService } from "./types";
import { TYPES } from "../constants/types";
import { CreatePostDTO, UpdatePostDTO } from './post.dto';

@injectable()
export class PostService implements IPostService {
    constructor(
        @inject(TYPES.PostRepository)
        private readonly postRepo: IPostRepository
    ) {}

    getPostById (id: number) {
        return this.postRepo.findById(id);
    }

    getPostsByAuthor (authorId: number) {
        return this.postRepo.findManyByAuthor(authorId);
    }

    createPost(data: CreatePostDTO): Promise<any> {
        return this.postRepo.create(data);
    }

    deletePost(id: number): Promise<any> {
        return this.postRepo.delete(id);
    }

    updatePost(id: number, data: UpdatePostDTO): Promise<any> {
        return this.postRepo.update(id, data);
    }
}