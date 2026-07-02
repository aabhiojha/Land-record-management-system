package np.com.abhishekojha.landrecordmanagementbackend.seeder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import np.com.abhishekojha.landrecordmanagementbackend.dto.request.LandRecordRequest;
import np.com.abhishekojha.landrecordmanagementbackend.repository.LandRecordRepository;
import np.com.abhishekojha.landrecordmanagementbackend.service.LandRecordService;
import np.com.abhishekojha.landrecordmanagementbackend.repository.UserRepository;
import np.com.abhishekojha.landrecordmanagementbackend.model.entity.User;
import np.com.abhishekojha.landrecordmanagementbackend.model.enums.UserRole;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final LandRecordRepository landRecordRepository;
    private final LandRecordService landRecordService;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        long currentCount = landRecordRepository.count();
        if (currentCount > 50) {
            log.info("Sufficient land records already exist ({}). Skipping bulk seed to prevent infinite growth.", currentCount);
            return;
        }

        log.info("Found {} land records. Seeding 40 more via bulk insertion...", currentCount);
        
        List<User> citizens = userRepository.findByRole(UserRole.CITIZEN);
        if (citizens.isEmpty()) {
            log.warn("No citizens found in the database. Cannot seed land records.");
            return;
        }
        
        List<LandRecordRequest> requests = new ArrayList<>();
        String[] districts = {"Kathmandu", "Lalitpur", "Bhaktapur", "Kaski", "Chitwan"};
        String[] municipalities = {"Kathmandu Metropolitian", "Lalitpur Metropolitian", "Bhaktapur Municipality", "Pokhara Metropolitian", "Bharatpur Metropolitian"};
        String[] types = {"AABAD", "KHET", "PAKHO"};
        
        for (int i = 1; i <= 40; i++) {
            User owner = citizens.get(i % citizens.size());
            // Offset Kitta numbers by current count to avoid unique constraint violations
            String kitta = "K-" + (1000 + currentCount + i);
            double area = 100.0 + (Math.random() * 5000.0);
            int locIndex = i % districts.length;
            String district = districts[locIndex];
            String municipality = municipalities[locIndex];
            int ward = (i % 32) + 1;
            String type = types[i % types.length];
            
            requests.add(createRequest(kitta, Math.round(area * 100.0) / 100.0, district, municipality, ward, type, owner.getId()));
        }
        
        try {
            landRecordService.createLandRecordsBulk(requests);
            log.info("Successfully seeded {} land records.", requests.size());
        } catch (Exception e) {
            log.error("Failed to seed land records: ", e);
        }
    }

    private LandRecordRequest createRequest(String kitta, double area, String district, String municipality, int ward, String type, Long ownerId) {
        LandRecordRequest req = new LandRecordRequest();
        req.setKittaNumber(kitta);
        req.setAreaSqMeters(area);
        req.setDistrict(district);
        req.setMunicipality(municipality);
        req.setWardNumber(ward);
        req.setLandType(type);
        req.setOwnerId(ownerId);
        return req;
    }
}
