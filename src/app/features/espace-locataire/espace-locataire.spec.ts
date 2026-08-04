import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspaceLocataire } from './espace-locataire';

describe('EspaceLocataire', () => {
  let component: EspaceLocataire;
  let fixture: ComponentFixture<EspaceLocataire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspaceLocataire],
    }).compileComponents();

    fixture = TestBed.createComponent(EspaceLocataire);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
