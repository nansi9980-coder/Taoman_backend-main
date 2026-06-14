import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectSubmissionsService } from './project-submissions.service';
import { assertPdfUpload } from '../common/pdf-upload.util';

@Controller('project-submissions')
export class ProjectSubmissionsController {
  constructor(private readonly projectSubmissionsService: ProjectSubmissionsService) {}

  @Post('submit')
  @UseInterceptors(FileInterceptor('attachment'))
  submit(
    @Body()
    data: {
      projectName: string;
      sector: string;
      location: string;
      amount?: string;
      horizon?: string;
      website?: string;
      description: string;
      contactName: string;
      contactEmail: string;
      contactPhone: string;
    },
    @UploadedFile() attachment?: Express.Multer.File,
  ) {
    assertPdfUpload(attachment);
    return this.projectSubmissionsService.submit(data, attachment);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.projectSubmissionsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.projectSubmissionsService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: { status?: string }) {
    return this.projectSubmissionsService.update(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.projectSubmissionsService.remove(+id);
  }
}
