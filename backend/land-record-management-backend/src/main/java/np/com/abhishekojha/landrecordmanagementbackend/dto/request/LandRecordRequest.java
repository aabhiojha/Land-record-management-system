package np.com.abhishekojha.landrecordmanagementbackend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LandRecordRequest {

    @NotBlank(message = "Kitta number is required")
    private String kittaNumber;

    @NotNull(message = "Area is required")
    @Min(value = 1, message = "Area must be positive")
    private Double areaSqMeters;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Municipality is required")
    private String municipality;

    @NotNull(message = "Ward number is required")
    @Min(value = 1, message = "Ward number must be positive")
    private Integer wardNumber;

    @NotBlank(message = "Land type is required")
    private String landType;

    @NotNull(message = "Owner ID is required")
    private Long ownerId;
}
