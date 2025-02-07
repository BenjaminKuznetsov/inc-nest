// import { Injectable } from '@nestjs/common';
// import { CommentInputDto } from '../api/dto/comment-input.dto';
// import { CommentRepo } from '../infra/comment.repo';
//
// @Injectable()
// export class CommentsService {
//   constructor(private readonly commentRepo: CommentRepo) {}
//
//   async create(dto: CommentInputDto): Promise<string> {
//     return this.commentRepo.create(dto);
//   }
//
//   async update(id: string, dto: CommentInputDto): Promise<void> {
//     return this.commentRepo.update(id, dto);
//   }
//
//   async delete(id: string): Promise<void> {
//     return this.commentRepo.delete(id);
//   }
// }
