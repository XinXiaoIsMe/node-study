import { CreatePostDTO, UpdatePostDTO } from './post.dto';

export interface IPostController {
    getPostById(params: { id: string }): Promise<any>;
    getPostsByAuthor(params: { authorId: string }): Promise<any>;
    createPost(data: CreatePostDTO): Promise<any>;
    updatePost(data: UpdatePostDTO & { id: number }): Promise<any>;
    deletePost(params: { id: string }): Promise<any>;
}

export interface IPostService {
    getPostById(id: number): Promise<any>;
    getPostsByAuthor(authorId: number): Promise<any[]>;
    createPost(data: CreatePostDTO): Promise<any>;
    updatePost(id: number, data: UpdatePostDTO): Promise<any>;
    deletePost(id: number): Promise<any>;
}

export interface IPostRepository {
    findById(id: number): Promise<any>;
    findManyByAuthor(authorId: number): Promise<any[]>;
    create(data: CreatePostDTO): Promise<any>;
    update(id: number, data: UpdatePostDTO): Promise<any>;
    delete(id: number): Promise<any>;
}
