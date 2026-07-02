package np.com.abhishekojha.landrecordmanagementbackend.service;

import np.com.abhishekojha.landrecordmanagementbackend.dto.response.DocumentResponse;
import np.com.abhishekojha.landrecordmanagementbackend.exception.BadRequestException;
import np.com.abhishekojha.landrecordmanagementbackend.exception.ResourceNotFoundException;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.Document;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.LandRecord;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.DocumentType;
import np.com.abhishekojha.landrecordmanagementbackend.repository.DocumentRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.LandRecordRepository;
import np.com.abhishekojha.landrecordmanagementbackend.repository.TransferRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private LandRecordRepository landRecordRepository;
    @Mock private TransferRepository transferRepository;
    @Mock private S3Client s3Client;

    @InjectMocks
    private DocumentService documentService;

    private User uploader;
    private LandRecord record;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(documentService, "bucket", "test-bucket");
        uploader = User.builder().id(1L).fullName("Officer").build();
        record = LandRecord.builder().id(10L).kittaNumber("KTM-1").currentOwner(uploader).build();
    }

    private MultipartFile file() {
        return new MockMultipartFile("file", "deed.pdf", "application/pdf", "hello".getBytes());
    }

    @Test
    void upload_Success_PutsToS3AndPersistsHash() {
        when(landRecordRepository.findById(10L)).thenReturn(Optional.of(record));
        when(documentRepository.save(any(Document.class))).thenAnswer(inv -> inv.getArgument(0));

        DocumentResponse response = documentService.upload(file(), 10L, null, "lalpurja", uploader);

        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
        ArgumentCaptor<Document> captor = ArgumentCaptor.forClass(Document.class);
        verify(documentRepository).save(captor.capture());
        Document saved = captor.getValue();

        assertEquals(DocumentType.LALPURJA, saved.getDocumentType());
        assertEquals("deed.pdf", saved.getFileName());
        assertTrue(saved.getFilePath().endsWith("_deed.pdf"));
        assertNotNull(saved.getDocumentHash());
        assertEquals(64, saved.getDocumentHash().length());
        assertEquals(10L, response.getLandRecordId());
        assertFalse(response.getIsVerified());
    }

    @Test
    void upload_UnknownRecord_ThrowsNotFound() {
        when(landRecordRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> documentService.upload(file(), 10L, null, "LALPURJA", uploader));
        verifyNoInteractions(s3Client);
    }

    @Test
    void upload_InvalidDocumentType_ThrowsBadRequest() {
        when(landRecordRepository.findById(10L)).thenReturn(Optional.of(record));

        assertThrows(BadRequestException.class,
                () -> documentService.upload(file(), 10L, null, "PASSPORT", uploader));
        verifyNoInteractions(s3Client);
    }

    @Test
    void upload_UnknownTransfer_ThrowsNotFound() {
        when(landRecordRepository.findById(10L)).thenReturn(Optional.of(record));
        when(transferRepository.findById(5L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> documentService.upload(file(), 10L, 5L, "LALPURJA", uploader));
        verifyNoInteractions(s3Client);
    }

    @Test
    void download_MissingKey_ThrowsNotFound() {
        Document doc = Document.builder().id(3L).filePath("missing-key").landRecord(record)
                .uploadedBy(uploader).documentType(DocumentType.OTHER).build();
        when(documentRepository.findById(3L)).thenReturn(Optional.of(doc));
        when(s3Client.getObject(any(GetObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("nope").build());

        assertThrows(ResourceNotFoundException.class, () -> documentService.download(3L));
    }

    @Test
    void download_UnknownDocument_ThrowsNotFound() {
        when(documentRepository.findById(3L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> documentService.download(3L));
        verifyNoInteractions(s3Client);
    }

    @Test
    void verifyDocument_MarksVerifiedByOfficer() {
        User officer = User.builder().id(2L).fullName("Verifier").build();
        Document doc = Document.builder().id(3L).landRecord(record).uploadedBy(uploader)
                .documentType(DocumentType.LALPURJA).isVerified(false).build();
        when(documentRepository.findById(3L)).thenReturn(Optional.of(doc));
        when(documentRepository.save(any(Document.class))).thenAnswer(inv -> inv.getArgument(0));

        DocumentResponse response = documentService.verifyDocument(3L, officer);

        assertTrue(doc.getIsVerified());
        assertEquals(officer, doc.getVerifiedBy());
        assertTrue(response.getIsVerified());
        assertEquals("Verifier", response.getVerifiedByName());
    }

    @Test
    void getByRecord_MapsAllDocuments() {
        Document doc = Document.builder().id(3L).landRecord(record).uploadedBy(uploader)
                .documentType(DocumentType.LALPURJA).fileName("a.pdf").build();
        when(documentRepository.findByLandRecordId(10L)).thenReturn(java.util.List.of(doc));

        var result = documentService.getByRecord(10L);

        assertEquals(1, result.size());
        assertEquals("a.pdf", result.get(0).getFileName());
    }
}
