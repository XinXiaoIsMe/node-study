import { inject } from 'inversify';
import { Body, Controller, Get, Params, Post, Delete, Put } from '@inversifyjs/http-core';
import { IPostController, IPostService } from './types';
import { TYPES } from '../constants/types';
import { CreatePostDTO, UpdatePostDTO } from './post.dto';

@Controller('post')
export class PostController implements IPostController {
    constructor(
        @inject(TYPES.PostService)
        private readonly postService: IPostService
    ) {}

    @Get('/:id')
    getPostById(@Params() params: { id: string; }): Promise<any> {
        return this.postService.getPostById(Number(params.id));
    }

    @Get('/getPostsByAuthor/:authorId')
    getPostsByAuthor(@Params() params: { authorId: string; }): Promise<any> {
        return this.postService.getPostsByAuthor(Number(params.authorId));
    }

    @Post('/create')
    createPost(@Body() data: CreatePostDTO): Promise<any> {
        return this.postService.createPost(data);
    }

    @Delete('/delete/:id')
    deletePost(@Params() params: { id: string }): Promise<any> {
        return this.postService.deletePost(Number(params.id));
    }

    @Put('/update')
    updatePost(@Body() data: UpdatePostDTO & { id: number; }): Promise<any> {
        const { id, ...updatePost } = data;
        return this.postService.updatePost(id, updatePost)
    }
}