package com.workshop.planning.controller;

import com.workshop.planning.dto.CreateOrderResponseDTO;
import com.workshop.planning.dto.PlanningRequestDTO;
import com.workshop.planning.entity.Planning;
import com.workshop.planning.service.PlanningService;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("api/plannings")
public class PlanningController {

    private final PlanningService planningService;

    public PlanningController(PlanningService planningService) {
        this.planningService = planningService;
    }

    @GetMapping("/getPlanning")
    public Planning getPlanning(@RequestParam("Planning_ID") Long id) {
        Planning p = planningService.getPlanning(id);
        return p;
    }

    @GetMapping("")
    public List<Planning> getAllPlannings() {
        List<Planning> plannings = planningService.getAllPlannings();
        return plannings;
    }

    @PostMapping
    public Planning createPlanning(@RequestBody PlanningRequestDTO planningRequestDTO) {
System.out.println(planningRequestDTO);        
        return planningService.createPlanning(planningRequestDTO);
    }

    @PostMapping("/{id}/create-order")
    public CompletableFuture<CreateOrderResponseDTO> createOrder(@PathVariable("id") Long id) {
        System.out.println("/{id}/create-order called");        
        return planningService.createOrderFromPlanning(id);
    }

    @DeleteMapping("/{id}")
    public void deletePlanning(@PathVariable("id") Long id){
        planningService.deletePlanning(id);
    }

}
