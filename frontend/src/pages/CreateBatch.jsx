import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EvidenceUploader from '../components/EvidenceUploader';
import { PackagePlus, ArrowRight, ShieldCheck, Sparkles, Layers } from 'lucide-react';

export default function CreateBatch() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    material: 'Lithium-Ion Battery Scrap (NMC 622)',
    inputWeight: 1000,
    processedWeight: 950,
    claimedRecoveredWeight: 680,
    downstreamWeight: 675,
    producer: 'VoltForge Dynamics Ltd',
    recycler: 'EcoLoop Hydrometallurgy Unit 4',
    buyer: 'CathodePure Advanced Materials',
    amountINR: 50000,
    scenario: 'NORMAL'
  });

  const materials = [
    'Lithium-Ion Battery Scrap (NMC 622)',
    'E-Waste Printed Circuit Boards (PCB Class 1)',
    'Post-Consumer PET Flakes (Clear Food Grade)',
    'End-of-Life Solar PV Modules (Monocrystalline)',
    'High-Density Polyethylene (HDPE Containers)',
    'Aluminium Dross & Smelter Scrap'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const created = await api.createBatch({
        ...formData,
        inputWeight: Number(formData.inputWeight),
        processedWeight: Number(formData.processedWeight),
        claimedRecoveredWeight: Number(formData.claimedRecoveredWeight),
        downstreamWeight: Number(formData.downstreamWeight),
        amountINR: Number(formData.amountINR)
      });
      navigate(`/batch/${created.id}`);
    } catch (err) {
      console.error("Batch creation failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div
        className="animate-reveal-up"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '24px 28px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 6,
              background: 'var(--teal-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <PackagePlus size={18} style={{ color: 'var(--teal)' }} />
          </div>
          <div>
            <h2 className="font-serif" style={{ fontSize: 22, color: 'var(--text)', margin: '0 0 4px' }}>
              Create Intake Batch
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Register physical circular feedstocks, plant telemetry parameters, and escrow terms
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Section 1 */}
        <div
          className="animate-reveal-up stagger-1"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="label-caps" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 10, marginBottom: 16 }}>
            1. Feedstock & Participant Metadata
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div>
              <label className="label-caps-sm" style={{ display: 'block', marginBottom: 6 }}>
                Material Classification
              </label>
              <select
                name="material"
                value={formData.material}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  fontSize: 12,
                  color: 'var(--text)',
                  outline: 'none',
                }}
              >
                {materials.map((m, i) => (
                  <option key={i} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-caps-sm" style={{ display: 'block', marginBottom: 6 }}>
                Escrow Settlement Value (INR)
              </label>
              <div style={{ position: 'relative' }}>
                <span className="font-mono" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13 }}>₹</span>
                <input
                  type="number"
                  name="amountINR"
                  value={formData.amountINR}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 28px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 13,
                    color: 'var(--teal)',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="label-caps-sm" style={{ display: 'block', marginBottom: 6 }}>
                Producer (Waste Generator)
              </label>
              <input
                type="text"
                name="producer"
                value={formData.producer}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  fontSize: 12,
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label className="label-caps-sm" style={{ display: 'block', marginBottom: 6 }}>
                Recycler Facility
              </label>
              <input
                type="text"
                name="recycler"
                value={formData.recycler}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  fontSize: 12,
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div
          className="animate-reveal-up stagger-2"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="label-caps" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 10, marginBottom: 16 }}>
            2. Mass Balance & Recovery Metrics (kg)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <div>
              <label className="label-caps-sm" style={{ display: 'block', marginBottom: 6 }}>
                Input Weight (kg)
              </label>
              <input
                type="number"
                name="inputWeight"
                value={formData.inputWeight}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13,
                  color: 'var(--earth)',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label className="label-caps-sm" style={{ display: 'block', marginBottom: 6 }}>
                Processed Weight (kg)
              </label>
              <input
                type="number"
                name="processedWeight"
                value={formData.processedWeight}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13,
                  color: 'var(--orange)',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label className="label-caps-sm" style={{ display: 'block', marginBottom: 6 }}>
                Claimed Recovered (kg)
              </label>
              <input
                type="number"
                name="claimedRecoveredWeight"
                value={formData.claimedRecoveredWeight}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13,
                  color: 'var(--gold)',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label className="label-caps-sm" style={{ display: 'block', marginBottom: 6 }}>
                Downstream Weight (kg)
              </label>
              <input
                type="number"
                name="downstreamWeight"
                value={formData.downstreamWeight}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13,
                  color: 'var(--text)',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Evidence attachment */}
        <EvidenceUploader />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            <Sparkles size={14} />
            <span>{submitting ? 'Anchoring Evidence Root...' : 'Create Batch'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
