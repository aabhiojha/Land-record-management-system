package np.com.abhishekojha.landrecordmanagementbackend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import np.com.abhishekojha.landrecordmanagementbackend.dto.response.DocumentResponse;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.service.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Document upload and management")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/api/documents/upload")
    @Operation(summary = "Upload a document")
    public ResponseEntity<DocumentResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("landRecordId") Long landRecordId,
            @RequestParam(value = "transferId", required = false) Long transferId,
            @RequestParam("documentType") String documentType,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(documentService.upload(file, landRecordId, transferId, documentType, user));
    }

    @GetMapping("/api/documents/record/{recordId}")
    @Operation(summary = "List documents for a land record")
    public ResponseEntity<List<DocumentResponse>> getByRecord(@PathVariable Long recordId) {
        return ResponseEntity.ok(documentService.getByRecord(recordId));
    }

    @GetMapping("/api/documents/{id}/download")
    @Operation(summary = "Download a document file")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        DocumentResponse meta = documentService.getDocumentMetadata(id);
        Resource resource = documentService.download(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        meta.getContentType() != null ? meta.getContentType() : "application/octet-stream"))
                .contentLength(meta.getFileSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + meta.getFileName() + "\"")
                .body(resource);
    }

    @PutMapping("/api/officer/documents/{id}/verify")
    @Operation(summary = "Verify a document (Officer)")
    public ResponseEntity<DocumentResponse> verify(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(documentService.verifyDocument(id, user));
    }
}
