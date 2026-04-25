package com.example.vehicle.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.vehicle.dto.VehicleRequestDTO;
import com.example.vehicle.dto.VehicleResponseDTO;
import com.example.vehicle.service.VehicleService;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService service;

    public VehicleController(VehicleService service) {
        this.service = service;
    }

    // CREATE
    @PostMapping
    public VehicleResponseDTO create(@RequestBody VehicleRequestDTO dto) {
        return service.create(dto);
    }

    // GET ALL
    @GetMapping
    public List<VehicleResponseDTO> getAllCars() {
        return service.getAllCars();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public VehicleResponseDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // GET BY CUSTOMER
    @GetMapping("/customer/{customerId}")
    public List<VehicleResponseDTO> getByCustomer(@PathVariable String customerId) {
        return service.getByCustomer(customerId);
    }

    // GET BY LICENSE PLATE
    @GetMapping("/plate/{plate}")
    public List<VehicleResponseDTO> getByPlate(@PathVariable String plate) {
        return service.getByLicense(plate);
    }

    // SEARCH
    @GetMapping("/search")
    public List<VehicleResponseDTO> search(@RequestParam String q) {
        return service.search(q);
    }

    // UPDATE
    @PutMapping("/{id}")
    public VehicleResponseDTO update(@PathVariable Long id,
                                     @RequestBody VehicleRequestDTO dto) {
        return service.update(id, dto);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // COUNT
    @GetMapping("/count")
    public Long count() {
        return service.count();
    }
}