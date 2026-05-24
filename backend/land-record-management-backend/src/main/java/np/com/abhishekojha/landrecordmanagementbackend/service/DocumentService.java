package np.com.abhishekojha.landrecordmanagementbackend.service;

import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.DocumentResponse;
import np.com.abhishekojha.landrecordmanagementbackend.exception.BadRequestException;
import np.com.abhishekojha.landrecordmanagementbackend.exception.ResourceNotFoundException;
import np.com.abhishekojha.landrecordmanagementbackend.merkle.MerkleTreeEngine;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.Document;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.Transfer;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.DocumentType;
import np.com.abhishekojha.landrecordmanagementbackend.repository.DocumentRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.LandRecordRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.TransferRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final LandRecordRepository landRecordRepository;
    private final TransferRepository transferRepository;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Transactional
    public DocumentResponse upload(MultipartFile file, Long landRecordId, Long transferId,
                                   String documentType, User uploader) {
        LandRecord record = landRecordRepository.findById(landRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Land record not found"));

        DocumentType docType;
        try {
            docType = DocumentType.valueOf(documentType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid document type: " + documentType);
        }

        Transfer transfer = null;
        if (transferId != null) {
            transfer = transferRepository.findById(transferId)
                    .orElseThrow(() -> new ResourceNotFoundException("Transfer not found"));
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(storedName);
            file.transferTo(filePath.toFile());

            String fileHash = MerkleTreeEngine.sha256(new String(file.getBytes()));

            Document doc = Document.builder()
                    .landRecord(record)
                    .transfer(transfer)
                    .uploadedBy(uploader)
                    .fileName(file.getOriginalFilename())
                    .filePath(filePath.toString())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .documentType(docType)
                    .documentHash(fileHash)
                    .build();

            doc = documentRepository.save(doc);
            return toResponse(doc);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    public List<DocumentResponse> getByRecord(Long recordId) {
        return documentRepository.findByLandRecordId(recordId).stream()
                .map(this::toResponse)
                .toList();
    }

    public Resource download(Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        try {
            Path path = Paths.get(doc.getFilePath()).normalize();
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists()) {
                throw new ResourceNotFoundException("File not found on disk");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid file path", e);
        }
    }

    public DocumentResponse getDocumentMetadata(Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        return toResponse(doc);
    }

    @Transactional
    public DocumentResponse verifyDocument(Long documentId, User officer) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        doc.setIsVerified(true);
        doc.setVerifiedBy(officer);
        doc = documentRepository.save(doc);
        return toResponse(doc);
    }

    private DocumentResponse toResponse(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .landRecordId(doc.getLandRecord().getId())
                .transferId(doc.getTransfer() != null ? doc.getTransfer().getId() : null)
                .uploadedByName(doc.getUploadedBy().getFullName())
                .fileName(doc.getFileName())
                .fileSize(doc.getFileSize())
                .contentType(doc.getContentType())
                .documentType(doc.getDocumentType().name())
                .documentHash(doc.getDocumentHash())
                .isVerified(doc.getIsVerified())
                .verifiedByName(doc.getVerifiedBy() != null ? doc.getVerifiedBy().getFullName() : null)
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
