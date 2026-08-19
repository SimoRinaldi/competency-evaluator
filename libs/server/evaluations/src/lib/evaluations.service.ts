import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ServerEvaluationsRepository } from '';

@Injectable()
export class ServerEvaluationsService {
    constructor( 
        private readonly evaluationsRepository: ServerEvaluationsRepository 
    ){}
}