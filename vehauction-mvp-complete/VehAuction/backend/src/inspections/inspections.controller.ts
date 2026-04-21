import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUserId } from '../auth/decorators/auth.decorators';

class SubmitInspectionDto {
  mechanicalGrade: string;
  engineStatus: string;
  transmissionStatus: string;
  brakesStatus?: string;
  suspensionStatus?: string;
  accidentHistory?: boolean;
  accidentNotes?: string;
  documentationVerified?: boolean;
  theftClearance?: boolean;
  overallNotes: string;
  photos?: string[];
  videoUrl?: string;
}

class ApproveInspectionDto {
  reason?: string;
}

@Controller('inspections')
export class InspectionsController {
  constructor(private inspectionsService: InspectionsService) {}

  @Get('queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSPECTOR')
  @HttpCode(HttpStatus.OK)
  async getInspectionQueue() {
    return this.inspectionsService.getInspectionQueue();
  }

  @Post('start/:vehicleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSPECTOR')
  @HttpCode(HttpStatus.CREATED)
  async startInspection(
    @Param('vehicleId') vehicleId: string,
    @CurrentUserId() inspectorId: string,
  ) {
    return this.inspectionsService.startInspection(vehicleId, inspectorId);
  }

  @Patch(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSPECTOR')
  @HttpCode(HttpStatus.OK)
  async submitInspection(
    @Param('id') reportId: string,
    @CurrentUserId() inspectorId: string,
    @Body() dto: SubmitInspectionDto,
  ) {
    return this.inspectionsService.submitInspection(reportId, inspectorId, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getInspectionReport(@Param('id') reportId: string) {
    return this.inspectionsService.getInspectionReport(reportId);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async approveInspection(
    @Param('id') reportId: string,
    @CurrentUserId() adminId: string,
  ) {
    return this.inspectionsService.approveInspection(reportId, adminId);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async rejectInspection(
    @Param('id') reportId: string,
    @CurrentUserId() adminId: string,
    @Body() dto: ApproveInspectionDto,
  ) {
    return this.inspectionsService.rejectInspection(
      reportId,
      adminId,
      dto.reason || 'Rejected by admin',
    );
  }
}
