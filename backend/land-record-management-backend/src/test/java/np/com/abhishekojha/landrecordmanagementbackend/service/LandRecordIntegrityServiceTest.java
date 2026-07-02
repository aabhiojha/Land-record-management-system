package np.com.abhishekojha.landrecordmanagementbackend.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * DB-independent unit tests for the canonical timestamp used in record hashing.
 * These pin down the fix for the false "integrity violation" that occurred when
 * a hash computed from a JVM nanosecond timestamp was later recomputed from the
 * same value truncated to microseconds by PostgreSQL.
 */
class LandRecordIntegrityServiceTest {

    @Test
    void canonicalTimestamp_ignoresSubMillisecondPrecision() {
        LocalDateTime withNanos = LocalDateTime.of(2026, 7, 1, 10, 30, 45, 123_456_789);
        LocalDateTime withMicros = LocalDateTime.of(2026, 7, 1, 10, 30, 45, 123_456_000);
        LocalDateTime withMillis = LocalDateTime.of(2026, 7, 1, 10, 30, 45, 123_000_000);

        String nanos = LandRecordIntegrityService.canonicalTimestamp(withNanos);
        String micros = LandRecordIntegrityService.canonicalTimestamp(withMicros);
        String millis = LandRecordIntegrityService.canonicalTimestamp(withMillis);

        // The same instant must canonicalize identically regardless of how much
        // sub-millisecond precision the backing store preserved, so the record
        // hash survives a persistence round-trip.
        assertEquals(nanos, micros);
        assertEquals(micros, millis);
        assertEquals("2026-07-01T10:30:45.123", millis);
    }

    @Test
    void canonicalTimestamp_alwaysEmitsThreeFractionDigits() {
        LocalDateTime whole = LocalDateTime.of(2026, 7, 1, 0, 0, 0);
        assertEquals("2026-07-01T00:00:00.000", LandRecordIntegrityService.canonicalTimestamp(whole));
    }

    @Test
    void canonicalTimestamp_isDeterministic() {
        LocalDateTime ts = LocalDateTime.of(2026, 7, 1, 10, 30, 45, 500_000_000);
        assertEquals(
                LandRecordIntegrityService.canonicalTimestamp(ts),
                LandRecordIntegrityService.canonicalTimestamp(ts));
    }
}
