import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InspectionsService {
  constructor(private prisma: PrismaService) {}

  async getInspectionQueue() {
    const pendingVehicles = await this.prisma.vehicle.findMany({
      where: { status: 'PENDING_INSPECTION' },
      include: { seller: { select: { firstName: true, lastName: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return pendingVehicles;
  }

  async startInspection(vehicleId: string, inspectorId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.status !== 'PENDING_INSPECTION') {
      throw new BadRequestException(
        'Vehicle is not pending inspection',
      );
    }

    const existingReport = await this.prisma.inspectionReport.findUnique({
      where: { vehicleId },
    });

    if (existingReport) {
      throw new BadRequestException('Inspection report already exists for this vehicle');
    }

    const report = await this.prisma.inspectionReport.create({
      data: {
        vehicleId,
        inspectorId,
        status: 'IN_PROGRESS',
      },
    });

    return report;
  }

  async submitInspection(
    reportId: string,
    inspectorId: string,
    data: any,
  ) {
    const report = await this.prisma.inspectionReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Inspection report not found');
    }

    if (report.inspectorId !== inspectorId) {
      throw new ForbiddenException(
        'You can only submit inspections you created',
      );
    }

    if (report.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Report is not in progress');
    }

    const updated = await this.prisma.inspectionReport.update({
      where: { id: reportId },
      data: {
        mechanicalGrade: data.mechanicalGrade,
        engineStatus: data.engineStatus,
        transmissionStatus: data.transmissionStatus,
        brakesStatus: data.brakesStatus,
        suspensionStatus: data.suspensionStatus,
        accidentHistory: data.accidentHistory || false,
        accidentNotes: data.accidentNotes,
        documentationVerified: data.documentationVerified || false,
        theftClearance: data.theftClearance || false,
        overallNotes: data.overallNotes,
        photos: data.photos || [],
        videoUrl: data.videoUrl,
        status: 'COMPLETED',
      },
    });

    return updated;
  }

  async getInspectionReport(reportId: string) {
    const report = await this.prisma.inspectionReport.findUnique({
      where: { id: reportId },
      include: {
        vehicle: true,
        inspector: { select: { firstName: true, lastName: true } },
      },
    });

    if (!report) {
      throw new NotFoundException('Inspection report not found');
    }

    return report;
  }

  async approveInspection(reportId: string, adminId: string) {
    const report = await this.prisma.inspectionReport.findUnique({
      where: { id: reportId },
      include: { vehicle: true },
    });

    if (!report) {
      throw new NotFoundException('Inspection report not found');
    }

    if (report.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed reports can be approved');
    }

    const updated = await this.prisma.inspectionReport.update({
      where: { id: reportId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    // Update vehicle status
    await this.prisma.vehicle.update({
      where: { id: report.vehicleId },
      data: { status: 'READY_FOR_AUCTION' },
    });

    return updated;
  }

  async rejectInspection(
    reportId: string,
    adminId: string,
    reason: string,
  ) {
    const report = await this.prisma.inspectionReport.findUnique({
      where: { id: reportId },
      include: { vehicle: true },
    });

    if (!report) {
      throw new NotFoundException('Inspection report not found');
    }

    const updated = await this.prisma.inspectionReport.update({
      where: { id: reportId },
      data: {
        status: 'REJECTED',
        approvedBy: adminId,
        rejectionReason: reason,
      },
    });

    // Reset vehicle to draft
    await this.prisma.vehicle.update({
      where: { id: report.vehicleId },
      data: { status: 'DRAFT' },
    });

    return updated;
  }
}
