package com.example.vehicle.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.vehicle.entity.Vehicle;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByCustomerId(String customerId);

    List<Vehicle> findByLicensePlateIgnoreCase(String licensePlate);

    List<Vehicle> findByBrandContainingIgnoreCase(String brand);

    List<Vehicle> findByModelContainingIgnoreCase(String model);

    List<Vehicle> findByVinContainingIgnoreCase(String vin);
}