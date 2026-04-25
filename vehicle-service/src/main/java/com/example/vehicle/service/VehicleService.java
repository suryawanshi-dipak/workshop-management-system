package com.example.vehicle.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.vehicle.dto.VehicleRequestDTO;
import com.example.vehicle.dto.VehicleResponseDTO;
import com.example.vehicle.entity.Vehicle;
import com.example.vehicle.repository.VehicleRepository;

@Service
public class VehicleService {

    private final VehicleRepository repository;

    public VehicleService(VehicleRepository repository) {
        this.repository = repository;
    }

    // CREATE
    public VehicleResponseDTO create(VehicleRequestDTO dto) {
        Vehicle v = new Vehicle();
        copy(dto, v);
        v = repository.save(v);
        v.setCarId("CAR-" + String.format("%03d", v.getId()));
        return mapToResponse(repository.save(v));
    }

    // GET ALL
    public List<VehicleResponseDTO> getAllCars() {
        return repository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET BY ID
    public VehicleResponseDTO getById(Long id) {
        Vehicle v = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        return mapToResponse(v);
    }

    // GET BY CUSTOMER
    public List<VehicleResponseDTO> getByCustomer(String customerId) {
        return repository.findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET BY LICENSE
    public List<VehicleResponseDTO> getByLicense(String plate) {
        return repository.findByLicensePlateIgnoreCase(plate)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // UPDATE
    public VehicleResponseDTO update(Long id, VehicleRequestDTO dto) {
        Vehicle v = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        copy(dto, v);
        return mapToResponse(repository.save(v));
    }

    // DELETE
    public void delete(Long id) {
        repository.deleteById(id);
    }

    // COUNT
    public Long count() {
        return repository.count();
    }

    // SEARCH
    public List<VehicleResponseDTO> search(String q) {
        List<Vehicle> result = new ArrayList<>();

        result.addAll(repository.findByBrandContainingIgnoreCase(q));
        result.addAll(repository.findByModelContainingIgnoreCase(q));
        result.addAll(repository.findByVinContainingIgnoreCase(q));
        result.addAll(repository.findByLicensePlateIgnoreCase(q));

        return result.stream()
                .distinct()
                .map(this::mapToResponse)
                .toList();
    }

    private void copy(VehicleRequestDTO dto, Vehicle v) {
        v.setLicensePlate(dto.getLicensePlate());
        v.setVin(dto.getVin());
        v.setBrand(dto.getBrand());
        v.setModel(dto.getModel());
        v.setMileage(dto.getMileage());
        v.setCustomerId(dto.getCustomerId() == null ? "":dto.getCustomerId());
    }

    private VehicleResponseDTO mapToResponse(Vehicle v) {
        VehicleResponseDTO dto = new VehicleResponseDTO();
        dto.setId(v.getId());
        dto.setLicensePlate(v.getLicensePlate());
        dto.setBrand(v.getBrand());
        dto.setVin(v.getVin());
        dto.setModel(v.getModel());
        dto.setMileage(v.getMileage());
        dto.setCustomerId(v.getCustomerId() == null ? "":v.getCustomerId());
        dto.setCarId(v.getCarId());
        return dto;
    }
}